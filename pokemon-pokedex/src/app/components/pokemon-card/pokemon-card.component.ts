import { Component, computed, inject, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { camera, heart, heartOutline } from 'ionicons/icons';
import { Pokemon } from '../../models/pokemon.model';
import { FavoritesService } from '../../services/favorites.service';
import { TypeEsPipe } from '../../pipes/dex.pipes';
import { typeColor } from '../../utils/type-labels';

/** Ficha de la Pokédex: número, imagen, nombre, tipos, favorito y acceso a la cámara. */
@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [DecimalPipe, IonIcon, TypeEsPipe],
  template: `
    <article class="dex-card" [style.--c]="color()" (click)="open.emit(pokemon().id)">
      <span class="num">Nº {{ pokemon().id | number: '3.0-0' }}</span>
      <button type="button" class="fav" [class.on]="isFav()" aria-label="Favorito" (click)="onFav($event)">
        <ion-icon [name]="isFav() ? 'heart' : 'heart-outline'"></ion-icon>
      </button>
      <div class="art">
        <img [src]="pokemon().image || 'assets/placeholder.svg'" [alt]="pokemon().name" loading="lazy" />
      </div>
      <h3>{{ pokemon().name }}</h3>
      <div class="types">
        @for (t of pokemon().types; track t) {
          <span class="type-badge" [class]="t.toLowerCase()">{{ t | typeEs }}</span>
        }
      </div>
      <button type="button" class="cam" (click)="onCamera($event)">
        <ion-icon name="camera"></ion-icon> Ver en AR
      </button>
    </article>
  `,
  styleUrl: './pokemon-card.component.scss',
})
export class PokemonCardComponent {
  private favorites = inject(FavoritesService);

  readonly pokemon = input.required<Pokemon>();
  readonly open = output<number>();
  readonly ar = output<number>();

  readonly color = computed(() => typeColor(this.pokemon().types[0]));
  readonly isFav = computed(() => this.favorites.favoriteIds().includes(this.pokemon().id));

  constructor() {
    addIcons({ camera, heart, heartOutline });
  }

  onFav(event: Event): void {
    event.stopPropagation();
    this.favorites.toggle(this.pokemon().id);
  }

  onCamera(event: Event): void {
    event.stopPropagation();
    this.ar.emit(this.pokemon().id);
  }
}
