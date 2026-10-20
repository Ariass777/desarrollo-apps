import { Component, ElementRef, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { IonContent, IonHeader, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  camera, cameraReverse, chevronBack, chevronForward, dice, heart, heartOutline,
  power, scan, search, stopCircle, sync, volumeHigh,
} from 'ionicons/icons';
import { Pokemon } from '../models/pokemon.model';
import { PokemonService } from '../services/pokemon.service';
import { ArSelectionService } from '../services/ar-selection.service';
import { FavoritesService } from '../services/favorites.service';
import { PokemonVoiceService } from '../services/pokemon-voice.service';
import { PokemonRecognizerService, Recognition } from '../services/pokemon-recognizer.service';
import { DexTopComponent } from '../components/dex-top/dex-top.component';
import { PrettyPipe, TypeEsPipe } from '../pipes/dex.pipes';

type CamState = 'idle' | 'starting' | 'on' | 'error';

interface DetectOption { id: number; name: string; pct: number }
/** Mensaje que se muestra bajo el recuadro de escaneo. */
interface Detect { kind: 'scanning' | 'hit' | 'maybe' | 'none' | 'error'; text: string; options: DetectOption[] }

const ACCEPT_PROB = 0.4;     // confianza mínima para aceptar un Pokémon
const AUTO_EVERY_MS = 1200;  // pausa entre análisis en modo automático
const CROP_SIZE = 224;       // tamaño de entrada de CLIP

/** Escena A-Frame transparente: se dibuja encima del video de la cámara. */
const SCENE_MARKUP = `
  <a-scene embedded vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false"
           loading-screen="enabled: false" background="transparent: true"
           renderer="alpha: true; antialias: true"
           cursor="rayOrigin: mouse" raycaster="objects: .clickable; far: 30">
    <a-entity camera look-controls="enabled: false" wasd-controls="enabled: false" position="0 1.6 0"></a-entity>
    <a-entity id="dex-rig" position="0 2.15 -3.6">
      <a-circle id="dex-shadow" radius="0.75" rotation="-90 0 0" position="0 -1.15 0"
                material="shader: flat; color: #000; opacity: 0.28; transparent: true"></a-circle>
      <a-image id="dex-art" class="clickable" width="2.3" height="2.3" transparent="true"
               animation__float="property: position; from: 0 -0.08 0; to: 0 0.12 0; dir: alternate; dur: 1400; easing: easeInOutSine; loop: true">
      </a-image>
    </a-entity>
  </a-scene>
`;

@Component({
  selector: 'app-camara',
  standalone: true,
  imports: [DecimalPipe, IonHeader, IonContent, IonIcon, IonSpinner, DexTopComponent, TypeEsPipe, PrettyPipe],
  templateUrl: './camara.page.html',
  styleUrls: ['./camara.page.scss'],
})
export class CamaraPage implements OnDestroy {
  private pokemonService = inject(PokemonService);
  private selection = inject(ArSelectionService);
  private favorites = inject(FavoritesService);
  private voice = inject(PokemonVoiceService);
  private recognizer = inject(PokemonRecognizerService);

  @ViewChild('reticle') private reticleRef?: ElementRef<HTMLDivElement>;
  @ViewChild('video') private videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('stage') private stageRef?: ElementRef<HTMLDivElement>;

  readonly pokemon = this.selection.pokemon;
  readonly speaking = this.voice.speaking;
  readonly state = signal<CamState>('idle');
  readonly errorMsg = signal('');
  readonly facing = signal<'environment' | 'user'>('environment');
  readonly panelOpen = signal(false); // cerrado por defecto para no tapar la cámara
  readonly autoVoice = signal(false);
  readonly query = signal('');

  // Reconocimiento con la cámara
  readonly modelStatus = this.recognizer.status;
  readonly modelProgress = this.recognizer.progress;
  readonly scanning = signal(false);
  readonly autoScan = signal(false);
  readonly detect = signal<Detect | null>(null);

  readonly isFav = computed(() => {
    const p = this.pokemon();
    return !!p && this.favorites.favoriteIds().includes(p.id);
  });

  readonly matches = computed<Pokemon[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      return [];
    }
    return this.pokemonService
      .pokemons()
      .filter((p) => p.name.toLowerCase().includes(q) || p.id.toString() === q)
      .slice(0, 6);
  });

  private stream?: MediaStream;
  private rigEl: HTMLElement | null = null;
  private artEl: HTMLElement | null = null;
  private sceneReady = false;
  private autoTimer?: ReturnType<typeof setTimeout>;
  private cropCanvas?: HTMLCanvasElement;
  private streakId: number | null = null;
  private streak = 0;

  constructor() {
    addIcons({
      camera, cameraReverse, chevronBack, chevronForward, dice, heart, heartOutline,
      power, scan, search, stopCircle, sync, volumeHigh,
    });

    // Cada vez que cambia el Pokémon elegido se actualiza el modelo en realidad aumentada.
    effect(() => {
      const p = this.pokemon();
      if (p) {
        this.updateScene(p);
      }
    });
  }

  // --- Ciclo de vida de Ionic: la cámara solo está encendida mientras la pestaña está visible ---
  ionViewDidEnter(): void {
    if (this.state() === 'idle' || this.state() === 'error') {
      void this.startCamera();
    }
  }

  ionViewWillLeave(): void {
    this.stopCamera();
    this.voice.stop();
  }

  ngOnDestroy(): void {
    this.clearAuto();
    this.stopCamera();
    this.voice.stop();
  }

  // --- Cámara ---
  async toggleCamera(): Promise<void> {
    if (this.state() === 'on' || this.state() === 'starting') {
      this.stopCamera();
    } else {
      await this.startCamera();
    }
  }

  async startCamera(): Promise<void> {
    this.state.set('starting');
    this.errorMsg.set('');
    try {
      await this.ensureCameraPermission();
      await this.openStream();
      await this.ensureScene();
      this.state.set('on');
      this.buzz();
      this.scheduleAuto(600);
    } catch (err) {
      this.stopStream();
      this.state.set('error');
      this.errorMsg.set(this.describeError(err));
    }
  }

  async switchCamera(): Promise<void> {
    this.facing.update((f) => (f === 'environment' ? 'user' : 'environment'));
    if (this.state() === 'on') {
      try {
        this.stopStream();
        await this.openStream();
      } catch (err) {
        this.state.set('error');
        this.errorMsg.set(this.describeError(err));
      }
    }
  }

  stopCamera(): void {
    this.clearAuto();
    this.detect.set(null);
    this.streakId = null;
    this.streak = 0;
    this.stopStream();
    const stage = this.stageRef?.nativeElement;
    if (stage) {
      stage.innerHTML = ''; // destruye la escena A-Frame y libera WebGL
    }
    this.sceneReady = false;
    this.rigEl = null;
    this.artEl = null;
    if (this.state() !== 'error') {
      this.state.set('idle');
    }
  }

  // --- Selección de Pokémon ---
  next(): void { this.selection.next(); this.afterChange(); }
  prev(): void { this.selection.prev(); this.afterChange(); }
  random(): void { this.selection.random(); this.afterChange(); }

  pick(p: Pokemon): void {
    this.selection.select(p.id);
    this.query.set('');
    this.afterChange();
  }

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value ?? '');
  }

  // --- Reconocimiento: la cámara identifica qué Pokémon tienes enfrente ---
  async scanOnce(): Promise<void> {
    await this.scan(false);
  }

  toggleAutoScan(): void {
    this.autoScan.update((v) => !v);
    this.streakId = null;
    this.streak = 0;
    if (this.autoScan()) {
      this.scheduleAuto(0);
    } else {
      this.clearAuto();
    }
  }

  chooseOption(id: number): void {
    this.selection.select(id);
    this.detect.set(null);
    this.afterChange();
  }

  private scheduleAuto(delay = AUTO_EVERY_MS): void {
    this.clearAuto();
    if (!this.autoScan() || this.state() !== 'on') {
      return;
    }
    this.autoTimer = setTimeout(async () => {
      await this.scan(true);
      this.scheduleAuto();
    }, delay);
  }

  private clearAuto(): void {
    if (this.autoTimer) {
      clearTimeout(this.autoTimer);
      this.autoTimer = undefined;
    }
  }

  private async scan(auto: boolean): Promise<void> {
    if (this.scanning() || this.state() !== 'on') {
      return;
    }
    this.scanning.set(true);
    try {
      if (this.recognizer.status() !== 'ready') {
        await this.recognizer.prepare(); // primera vez: descarga el modelo (se muestra el progreso)
      }
      if (this.state() !== 'on') {
        return; // la cámara se apagó mientras se descargaba el modelo
      }
      const frame = this.captureFrame(); // se captura DESPUÉS de cargar, para analizar la imagen actual
      if (!frame) {
        return;
      }
      const result = await this.recognizer.recognize(frame);
      if (this.state() === 'on') {
        this.applyResult(result, auto);
      }
    } catch (err) {
      console.error('Error al reconocer', err);
      this.autoScan.set(false);
      this.clearAuto();
      this.detect.set({
        kind: 'error',
        text: this.recognizer.error() || 'No se pudo reconocer. Inténtalo de nuevo.',
        options: [],
      });
    } finally {
      this.scanning.set(false);
    }
  }

  private applyResult(r: Recognition, auto: boolean): void {
    const best = r.best;
    if (!best) {
      this.resetStreak();
      this.detect.set({ kind: 'none', text: 'No veo ningún Pokémon. Acércalo al recuadro.', options: [] });
      return;
    }
    if (best.prob < ACCEPT_PROB) {
      this.resetStreak();
      this.detect.set({
        kind: 'maybe',
        text: '¿Será alguno de estos?',
        options: r.top.map((c) => ({ id: c.id, name: this.label(c.name), pct: Math.round(c.prob * 100) })),
      });
      return;
    }
    if (auto) {
      // En automático se pide el mismo resultado 2 veces seguidas para evitar parpadeos.
      if (best.id === this.streakId) {
        this.streak++;
      } else {
        this.streakId = best.id;
        this.streak = 1;
      }
      if (this.streak < 2) {
        this.detect.set({ kind: 'scanning', text: 'Analizando...', options: [] });
        return;
      }
    }
    this.detect.set({ kind: 'hit', text: `${this.label(best.name)} · ${Math.round(best.prob * 100)}%`, options: [] });
    if (this.pokemon()?.id !== best.id) {
      this.selection.select(best.id);
      this.afterChange();
    }
  }

  private resetStreak(): void {
    this.streakId = null;
    this.streak = 0;
  }

  private label(name: string): string {
    return name.replace(/-/g, ' ');
  }

  /** Recorta del video justo la zona del recuadro de escaneo (el video usa object-fit: cover). */
  private captureFrame(): HTMLCanvasElement | null {
    const video = this.videoRef?.nativeElement;
    const reticle = this.reticleRef?.nativeElement;
    if (!video || !reticle || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const vr = video.getBoundingClientRect();
    const rr = reticle.getBoundingClientRect();
    const scale = Math.max(vr.width / vw, vr.height / vh);
    const offX = (vr.width - vw * scale) / 2;
    const offY = (vr.height - vh * scale) / 2;

    let sx = (rr.left - vr.left - offX) / scale;
    let sy = (rr.top - vr.top - offY) / scale;
    let sw = rr.width / scale;
    let sh = rr.height / scale;
    if (this.facing() === 'user') {
      sx = vw - sx - sw; // el video se ve espejado, el fotograma real no
    }
    sx = Math.max(0, Math.min(sx, vw - 1));
    sy = Math.max(0, Math.min(sy, vh - 1));
    sw = Math.max(1, Math.min(sw, vw - sx));
    sh = Math.max(1, Math.min(sh, vh - sy));

    const canvas = this.cropCanvas ?? (this.cropCanvas = document.createElement('canvas'));
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return null;
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, CROP_SIZE, CROP_SIZE);
    return canvas;
  }

  // --- Voz (jtalk / síntesis del navegador) ---
  speak(): void {
    if (this.speaking()) {
      this.voice.stop();
    } else {
      void this.voice.speak(this.pokemon());
    }
  }

  toggleAutoVoice(): void {
    this.autoVoice.update((v) => !v);
    if (!this.autoVoice()) {
      this.voice.stop();
    }
  }

  toggleFavorite(): void {
    const p = this.pokemon();
    if (p) {
      this.favorites.toggle(p.id);
    }
  }

  togglePanel(): void {
    this.panelOpen.update((v) => !v);
  }

  // --- Internos ---
  private afterChange(): void {
    this.buzz();
    if (this.autoVoice() && this.state() === 'on') {
      void this.voice.speak(this.pokemon());
    }
  }

  private buzz(): void {
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  }

  /** En el celular, Capacitor pide el permiso nativo de cámara antes de abrir el video. */
  private async ensureCameraPermission(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    const current = await Camera.checkPermissions();
    if (current.camera === 'granted' || current.camera === 'limited') {
      return;
    }
    const result = await Camera.requestPermissions({ permissions: ['camera'] });
    if (result.camera !== 'granted' && result.camera !== 'limited') {
      throw new Error('PERMISSION_DENIED');
    }
  }

  private async openStream(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('NO_MEDIA');
    }
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: this.facing() }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    const video = this.videoRef?.nativeElement;
    if (!video) {
      throw new Error('NO_VIDEO');
    }
    video.muted = true;
    video.srcObject = this.stream;
    await video.play();
  }

  private stopStream(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = undefined;
    const video = this.videoRef?.nativeElement;
    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }

  private async ensureScene(): Promise<void> {
    if (this.sceneReady) {
      return;
    }
    await import('aframe'); // registra A-Frame (window.AFRAME) solo cuando se necesita
    const stage = this.stageRef?.nativeElement;
    if (!stage) {
      return;
    }
    stage.innerHTML = SCENE_MARKUP;
    this.rigEl = stage.querySelector('#dex-rig');
    this.artEl = stage.querySelector('#dex-art');
    // Tocar al Pokémon en la escena AR lo hace "hablar".
    this.artEl?.addEventListener('click', () => this.speak());
    this.sceneReady = true;

    const p = this.pokemon();
    if (p) {
      this.updateScene(p);
    }
  }

  private updateScene(p: Pokemon): void {
    if (!this.sceneReady || !this.artEl || !this.rigEl) {
      return;
    }
    this.artEl.setAttribute('src', p.image || 'assets/placeholder.svg');
    // Animación de "aparición" cada vez que cambia el Pokémon.
    this.rigEl.removeAttribute('animation__pop');
    this.rigEl.setAttribute('scale', '0.01 0.01 0.01');
    this.rigEl.setAttribute('animation__pop', 'property: scale; to: 1 1 1; dur: 650; easing: easeOutBack');
  }

  private describeError(err: unknown): string {
    const msg = err instanceof Error ? `${err.name} ${err.message}` : String(err);
    if (msg.includes('PERMISSION_DENIED') || msg.includes('NotAllowed') || msg.includes('Permission')) {
      return 'No hay permiso para usar la cámara. Actívalo en los ajustes del celular y vuelve a intentarlo.';
    }
    if (msg.includes('NotFound') || msg.includes('OverconstrainedError')) {
      return 'No se encontró una cámara disponible en este dispositivo.';
    }
    if (msg.includes('NO_MEDIA')) {
      return 'Este navegador no permite abrir la cámara (necesita https o localhost).';
    }
    return 'No se pudo encender la cámara. Inténtalo de nuevo.';
  }
}
