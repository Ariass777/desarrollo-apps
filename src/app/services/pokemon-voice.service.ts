import { Injectable, signal } from '@angular/core';
import { Pokemon } from '../models/pokemon.model';
import { pretty, typeEs } from '../utils/type-labels';

type JtalkApi = ((text: string) => unknown) | { speak?: (text: string) => unknown };

/**
 * Voz del Pokédex.
 * 1) Si existe `window.jtalk` (la librería jtalk cargada en index.html) se usa esa.
 * 2) Si no, se usa la síntesis de voz del navegador/WebView en español.
 */
@Injectable({ providedIn: 'root' })
export class PokemonVoiceService {
  readonly speaking = signal(false);

  async speak(pokemon: Pokemon | undefined): Promise<void> {
    if (!pokemon) {
      return;
    }
    this.stop();
    const text = this.buildNarration(pokemon);

    const jtalk = (window as Window & { jtalk?: JtalkApi }).jtalk;
    try {
      if (typeof jtalk === 'function') {
        this.speaking.set(true);
        await jtalk(text);
        this.speaking.set(false);
        return;
      }
      if (jtalk && typeof jtalk.speak === 'function') {
        this.speaking.set(true);
        await jtalk.speak(text);
        this.speaking.set(false);
        return;
      }
    } catch {
      this.speaking.set(false);
    }

    this.speakWithBrowser(text);
  }

  stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.speaking.set(false);
  }

  private speakWithBrowser(text: string): void {
    if (!('speechSynthesis' in window)) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;
    const spanishVoice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
    utterance.onstart = () => this.speaking.set(true);
    utterance.onend = () => this.speaking.set(false);
    utterance.onerror = () => this.speaking.set(false);
    window.speechSynthesis.speak(utterance);
  }

  private buildNarration(p: Pokemon): string {
    const types = (p.types ?? []).map(typeEs).join(' y ') || 'desconocido';
    const abilities = (p.abilities ?? []).map(pretty).join(', ') || 'sin habilidades registradas';
    const attacks = (p.attacks ?? []).slice(0, 4).map(pretty).join(', ') || 'sin ataques registrados';
    const description = p.description || `${p.name} es un Pokémon.`;
    return `${p.name}. ${description} Es de tipo ${types}. Pesa ${p.weight} kilogramos. Sus habilidades son ${abilities}. Algunos de sus ataques son ${attacks}.`;
  }
}
