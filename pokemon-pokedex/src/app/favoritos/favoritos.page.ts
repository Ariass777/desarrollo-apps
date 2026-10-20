import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonHeader, IonIcon, IonSpinner, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heart } from 'ionicons/icons';
import { Pokemon } from '../models/pokemon.model';
import { PokemonService } from '../services/pokemon.service';
import { FavoritesService } from '../services/favorites.service';
import { ArSelectionService } from '../services/ar-selection.service';
import { DexTopComponent } from '../components/dex-top/dex-top.component';
import { PokemonCardComponent } from '../components/pokemon-card/pokemon-card.component';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [IonHeader, IonContent, IonButton, IonIcon, IonSpinner, DexTopComponent, PokemonCardComponent],
  template: `
    <ion-header class="ion-no-border">
      <app-dex-top title="Pokédex" subtitle="Favoritos"></app-dex-top>
    </ion-header>

    <ion-content class="dex-body">
      <section class="dex-screen">
        <div class="lcd">
          @if (loading() && favorites().length === 0) {
            <div class="state"><ion-spinner name="crescent" color="danger"></ion-spinner></div>
          } @else if (favorites().length === 0) {
            <div class="state">
              <ion-icon name="heart" class="big-heart"></ion-icon>
              <h2>Aún no tienes favoritos</h2>
              <p>Toca el corazón de cualquier Pokémon para guardarlo aquí.</p>
              <ion-button color="danger" (click)="goHome()">Explorar la Pokédex</ion-button>
            </div>
          } @else {
            <p class="count">{{ favorites().length }} favorito{{ favorites().length === 1 ? '' : 's' }}</p>
            <div class="dex-grid">
              @for (p of favorites(); track p.id) {
                <app-pokemon-card [pokemon]="p" (open)="goToDetail($event)" (ar)="openInCamera($event)"></app-pokemon-card>
              }
            </div>
          }
        </div>
      </section>
    </ion-content>
  `,
  styles: `
    .count { margin: 0 0 10px; font: 700 0.75rem monospace; letter-spacing: 1px; text-transform: uppercase; opacity: 0.75; }
    .dex-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
    .state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 36px 12px; text-align: center; }
    .state h2 { margin: 0; }
    .state p { margin: 0; opacity: 0.8; }
    .big-heart { font-size: 64px; color: #d32f2f; filter: drop-shadow(0 0 8px rgba(211, 47, 47, 0.5)); }
  `,
})
export class FavoritosPage {
  private pokemonService = inject(PokemonService);
  private favoritesService = inject(FavoritesService);
  private arSelection = inject(ArSelectionService);
  private navCtrl = inject(NavController);
  private router = inject(Router);

  readonly loading = this.pokemonService.loading;

  /** Favoritos en el orden en que se fueron guardando. */
  readonly favorites = computed<Pokemon[]>(() => {
    const all = this.pokemonService.pokemons();
    return this.favoritesService
      .favoriteIds()
      .map((id) => all.find((p) => p.id === id))
      .filter((p): p is Pokemon => !!p);
  });

  constructor() {
    addIcons({ heart });
  }

  goToDetail(id: number): void {
    this.navCtrl.navigateForward(['/pokemon-detail', id]);
  }

  openInCamera(id: number): void {
    this.arSelection.openInCamera(id);
  }

  goHome(): void {
    this.router.navigateByUrl('/home');
  }
}
