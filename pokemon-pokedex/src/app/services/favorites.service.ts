import { Injectable, computed, signal } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const STORAGE_KEY = 'favorite-pokemons';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private ids = signal<number[]>(this.read());

  readonly favoriteIds = this.ids.asReadonly();
  readonly count = computed(() => this.ids().length);

  isFavorite(id: number): boolean {
    return this.ids().includes(id);
  }

  toggle(id: number): void {
    this.ids.update((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.ids()));
    // Pequeña vibración en el celular; en el navegador simplemente no hace nada.
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  }

  private read(): number[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      return Array.isArray(parsed) ? parsed.filter((x): x is number => typeof x === 'number') : [];
    } catch {
      return [];
    }
  }
}
