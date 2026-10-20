import { Injectable, inject, signal } from '@angular/core';
import { PokemonService } from './pokemon.service';

/**
 * Reconocimiento de Pokémon con la cámara, 100 % en el dispositivo (sin API keys).
 *
 * Usa CLIP (Xenova/clip-vit-base-patch32 vía Transformers.js): convierte la imagen de la cámara en un
 * vector y lo compara con vectores de texto ("a photo of pikachu, a pokémon") de cada Pokémon de la
 * Pokédex. Funciona con juguetes, peluches, cartas, dibujos y pantallas, sin entrenar nada.
 *
 * El modelo se descarga una sola vez (~150 MB la primera vez; luego queda en caché del navegador) y
 * los vectores de texto se guardan en localStorage para no recalcularlos.
 */

const MODEL_ID = 'Xenova/clip-vit-base-patch32';
const CACHE_KEY = 'pokedex-clip-text-v1';
const LOGIT_SCALE = 100; // temperatura con la que CLIP fue entrenado

/** Plantillas de texto: se promedian para que funcione con fotos, peluches, cartas y dibujos. */
const TEMPLATES = [
  (n: string) => `a photo of ${n}, a pokémon`,
  (n: string) => `a plush toy or figure of ${n} from pokémon`,
  (n: string) => `a drawing or card of ${n}, pokémon artwork`,
];

/** Clases "de relleno": si ganan, es que la cámara no está viendo ningún Pokémon. */
const BACKGROUND = [
  'a photo of a person face',
  'a photo of a human hand',
  'a photo of a room interior',
  'a photo of a plain wall',
  'a photo of a table or desk',
  'a photo of the floor',
  'a blurry out of focus photo',
  'a dark photo with nothing in it',
];

const SPECIAL_NAMES: Record<string, string> = {
  'nidoran-f': 'Nidoran female',
  'nidoran-m': 'Nidoran male',
  'mr-mime': 'Mr. Mime',
  farfetchd: "Farfetch'd",
};

export interface RecognitionCandidate {
  id: number;
  name: string;
  prob: number; // 0..1
}

export interface Recognition {
  /** Mejor Pokémon encontrado (si el fondo no ganó). */
  best: RecognitionCandidate | null;
  /** Los 3 más probables, útil para "¿será este?". */
  top: RecognitionCandidate[];
  /** true si lo más probable es que no haya ningún Pokémon en la imagen. */
  noPokemon: boolean;
}

export type RecognizerStatus = 'idle' | 'loading' | 'ready' | 'error';

interface TensorLike {
  data: Float32Array;
  dims: number[];
}
type Embedder = (inputs: unknown) => Promise<Record<string, TensorLike>>;
type Tokenizer = (texts: string[], options: object) => unknown;
type Processor = (image: unknown) => Promise<unknown>;
interface ProgressInfo {
  status?: string;
  file?: string;
  loaded?: number;
  total?: number;
}

interface Engine {
  vision: Embedder;
  processor: Processor;
  rawImageFromCanvas: (c: HTMLCanvasElement) => unknown;
  labels: { id: number; name: string }[];
  /** [labels..., background...] normalizados, de tamaño (n + bg) * dim */
  text: Float32Array;
  dim: number;
}

@Injectable({ providedIn: 'root' })
export class PokemonRecognizerService {
  private pokemonService = inject(PokemonService);

  readonly status = signal<RecognizerStatus>('idle');
  /** 0..100, solo tiene sentido mientras status === 'loading'. */
  readonly progress = signal(0);
  readonly error = signal('');

  private engine?: Engine;
  private loading?: Promise<Engine>;
  private files = new Map<string, { loaded: number; total: number }>();

  /** Descarga/prepara el modelo (si hace falta). Es seguro llamarlo varias veces. */
  async prepare(): Promise<void> {
    await this.load();
  }

  private load(): Promise<Engine> {
    if (this.engine) {
      return Promise.resolve(this.engine);
    }
    if (!this.loading) {
      this.status.set('loading');
      this.progress.set(0);
      this.error.set('');
      this.files.clear();
      this.loading = this.buildEngine()
        .then((engine) => {
          this.engine = engine;
          this.status.set('ready');
          return engine;
        })
        .catch((err) => {
          console.error('No se pudo preparar el reconocimiento', err);
          this.status.set('error');
          this.error.set('No se pudo cargar el modelo de reconocimiento. Revisa tu conexión a internet.');
          throw err;
        })
        .finally(() => {
          this.loading = undefined;
        });
    }
    return this.loading;
  }

  /** Analiza un recorte cuadrado de la cámara. */
  async recognize(canvas: HTMLCanvasElement): Promise<Recognition> {
    const engine = await this.load();
    const { vision, processor, rawImageFromCanvas, labels, text, dim } = engine;

    const inputs = await processor(await rawImageFromCanvas(canvas));
    const out = await vision(inputs);
    const raw = out['image_embeds']?.data;
    if (!raw) {
      throw new Error('El modelo no devolvió la imagen procesada');
    }
    const img = normalize(Float32Array.from(raw));

    const total = text.length / dim;
    const logits = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      let dot = 0;
      const off = i * dim;
      for (let k = 0; k < dim; k++) {
        dot += img[k] * text[off + k];
      }
      logits[i] = dot * LOGIT_SCALE;
    }
    const probs = softmax(logits);

    const pokes: RecognitionCandidate[] = labels
      .map((l, i) => ({ id: l.id, name: l.name, prob: probs[i] }))
      .sort((a, b) => b.prob - a.prob);

    let bgProb = 0;
    for (let i = labels.length; i < total; i++) {
      bgProb += probs[i];
    }

    const top = pokes.slice(0, 3);
    const noPokemon = bgProb > top[0].prob;
    return { best: noPokemon ? null : top[0], top, noPokemon };
  }

  // ---------------------------------------------------------------------------------------------

  private async buildEngine(): Promise<Engine> {
    const list = this.pokemonService
      .pokemons()
      .filter((p) => !p.isCustom && p.id < 900)
      .sort((a, b) => a.id - b.id);
    if (list.length === 0) {
      throw new Error('La Pokédex todavía no cargó');
    }
    const labels = list.map((p) => ({ id: p.id, name: p.name }));

    // Import dinámico: la librería (pesada) solo se carga cuando el usuario pide reconocer.
    const tf = await import('@huggingface/transformers');
    tf.env.allowLocalModels = false; // evita que busque el modelo en el servidor de la app

    const options = {
      dtype: 'q8', // modelo cuantizado: ~4x más liviano y rápido en móvil
      progress_callback: (info: ProgressInfo) => this.onProgress(info),
    } as never;

    const processor = (await tf.AutoProcessor.from_pretrained(MODEL_ID)) as unknown as Processor;
    const vision = (await tf.CLIPVisionModelWithProjection.from_pretrained(MODEL_ID, options)) as unknown as Embedder;

    // Vectores de texto: de la caché si existen, si no se calculan una vez y se guardan.
    let cached = this.readTextCache(labels.map((l) => l.id));
    if (!cached) {
      const tokenizer = (await tf.AutoTokenizer.from_pretrained(MODEL_ID)) as unknown as Tokenizer;
      const textModel = (await tf.CLIPTextModelWithProjection.from_pretrained(MODEL_ID, options)) as unknown as Embedder;
      cached = await this.computeTextEmbeddings(tokenizer, textModel, labels);
      this.writeTextCache(labels.map((l) => l.id), cached);
    }

    this.progress.set(100);
    return {
      vision,
      processor,
      rawImageFromCanvas: (c) => tf.RawImage.fromCanvas(c),
      labels,
      text: cached.data,
      dim: cached.dim,
    };
  }

  private async computeTextEmbeddings(
    tokenizer: Tokenizer,
    textModel: Embedder,
    labels: { id: number; name: string }[],
  ): Promise<{ data: Float32Array; dim: number }> {
    const embed = async (texts: string[]): Promise<{ data: Float32Array; dim: number }> => {
      const inputs = tokenizer(texts, { padding: true, truncation: true });
      const out = await textModel(inputs);
      const t = out['text_embeds'];
      return { data: t.data, dim: t.dims[t.dims.length - 1] };
    };

    const BATCH = 32;
    const rows: Float32Array[] = [];
    let dim = 0;

    // Un vector por Pokémon = promedio normalizado de las plantillas.
    for (let i = 0; i < labels.length; i += BATCH) {
      const chunk = labels.slice(i, i + BATCH);
      const texts: string[] = [];
      for (const l of chunk) {
        const n = displayName(l.name);
        for (const tpl of TEMPLATES) {
          texts.push(tpl(n));
        }
      }
      const res = await embed(texts);
      dim = res.dim;
      for (let j = 0; j < chunk.length; j++) {
        const avg = new Float32Array(dim);
        for (let t = 0; t < TEMPLATES.length; t++) {
          const off = (j * TEMPLATES.length + t) * dim;
          const v = normalize(res.data.slice(off, off + dim));
          for (let k = 0; k < dim; k++) {
            avg[k] += v[k];
          }
        }
        rows.push(normalize(avg));
      }
    }

    const bg = await embed(BACKGROUND);
    for (let j = 0; j < BACKGROUND.length; j++) {
      rows.push(normalize(bg.data.slice(j * dim, (j + 1) * dim)));
    }

    const data = new Float32Array(rows.length * dim);
    rows.forEach((r, i) => data.set(r, i * dim));
    return { data, dim };
  }

  private onProgress(info: ProgressInfo): void {
    if (!info.file || typeof info.total !== 'number' || info.total <= 0) {
      return;
    }
    this.files.set(info.file, { loaded: info.loaded ?? 0, total: info.total });
    let loaded = 0;
    let total = 0;
    this.files.forEach((f) => {
      loaded += f.loaded;
      total += f.total;
    });
    this.progress.set(total > 0 ? Math.min(99, Math.round((loaded / total) * 100)) : 0);
  }

  // --- caché de vectores de texto (localStorage) ---
  private readTextCache(ids: number[]): { data: Float32Array; dim: number } | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) {
        return null;
      }
      const c = JSON.parse(raw) as { ids: number[]; bg: number; dim: number; data: string };
      if (c.bg !== BACKGROUND.length || c.ids.length !== ids.length || c.ids.some((id, i) => id !== ids[i])) {
        return null;
      }
      const data = base64ToFloats(c.data);
      return data.length === (ids.length + c.bg) * c.dim ? { data, dim: c.dim } : null;
    } catch {
      return null;
    }
  }

  private writeTextCache(ids: number[], v: { data: Float32Array; dim: number }): void {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ ids, bg: BACKGROUND.length, dim: v.dim, data: floatsToBase64(v.data) }),
      );
    } catch {
      /* si no hay espacio, simplemente se recalcula la próxima vez */
    }
  }
}

// --- utilidades ---
function displayName(apiName: string): string {
  return SPECIAL_NAMES[apiName] ?? apiName.replace(/-/g, ' ');
}

function normalize(v: Float32Array): Float32Array {
  let sum = 0;
  for (let i = 0; i < v.length; i++) {
    sum += v[i] * v[i];
  }
  const norm = Math.sqrt(sum) || 1;
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) {
    out[i] = v[i] / norm;
  }
  return out;
}

function softmax(logits: Float32Array): Float32Array {
  let max = -Infinity;
  for (const x of logits) {
    max = Math.max(max, x);
  }
  const out = new Float32Array(logits.length);
  let sum = 0;
  for (let i = 0; i < logits.length; i++) {
    out[i] = Math.exp(logits[i] - max);
    sum += out[i];
  }
  for (let i = 0; i < out.length; i++) {
    out[i] /= sum;
  }
  return out;
}

function floatsToBase64(a: Float32Array): string {
  const bytes = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

function base64ToFloats(s: string): Float32Array {
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return new Float32Array(bytes.buffer);
}
