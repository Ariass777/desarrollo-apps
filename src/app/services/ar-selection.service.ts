import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Pokemon } from '../models/pokemon.model';
import { PokemonService } from './pokemon.service';

const DEFAULT_ID = 25; // Pikachu

/** Guarda qué Pokémon se muestra en la vista de cámara (y lo comparten las demás vistas). */
@Injectable({ providedIn: 'root' })
export class ArSelectionService {
  private pokemonService = inject(PokemonService);
  private router = inject(Router);
  private selectedId = signal<number | null>(null);

  readonly pokemon = computed<Pokemon | undefined>(() => {
    const list = this.pokemonService.pokemons();
    if (list.length === 0) {
      return undefined;
    }
    const id = this.selectedId();
    return (
      (id !== null ? list.find((p) => p.id === id) : undefined) ??
      list.find((p) => p.id === DEFAULT_ID) ??
      list[0]
    );
  });

  select(id: number): void {
    this.selectedId.set(id);
  }

  next(): void {
    this.step(1);
  }

  prev(): void {
    this.step(-1);
  }

  random(): void {
    const list = this.pokemonService.pokemons();
    if (list.length > 0) {
      this.select(list[Math.floor(Math.random() * list.length)].id);
    }
  }

  openInCamera(id: number): Promise<boolean> {
    this.select(id);
    return this.router.navigateByUrl('/camara');
  }

  private step(direction: 1 | -1): void {
    const list = [...this.pokemonService.pokemons()].sort((a, b) => a.id - b.id);
    if (list.length === 0) {
      return;
    }
    const current = this.pokemon();
    const index = list.findIndex((p) => p.id === current?.id);
    const nextIndex = (index + direction + list.length) % list.length;
    this.select(list[nextIndex].id);
  }
}
