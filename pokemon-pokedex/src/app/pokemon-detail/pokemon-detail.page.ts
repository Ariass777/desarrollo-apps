import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { createOutline, heart, heartOutline, trashOutline } from 'ionicons/icons';
import { PokemonService } from '../services/pokemon.service';
import { PokemonVoiceService } from '../services/pokemon-voice.service';
import { FavoritesService } from '../services/favorites.service';
import { ArSelectionService } from '../services/ar-selection.service';
import { PrettyPipe, TypeEsPipe } from '../pipes/dex.pipes';

import {
  AlertController, NavController,
  IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonProgressBar, IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner
} from '@ionic/angular';

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: './pokemon-detail.page.html',
  styleUrls: ['./pokemon-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, TypeEsPipe, PrettyPipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonProgressBar, IonButtons, IonBackButton, IonButton, IonIcon, IonSpinner
  ]
})
export class PokemonDetailPage {
  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private pokemonService = inject(PokemonService);
  private voiceService = inject(PokemonVoiceService);
  private favorites = inject(FavoritesService);
  private arSelection = inject(ArSelectionService);

  private id = toSignal(
    this.route.paramMap.pipe(map((p) => Number(p.get('id')))),
    { initialValue: 0 }
  );

  pokemon = computed(() => this.pokemonService.getById(this.id()));
  isFav = computed(() => this.favorites.favoriteIds().includes(this.id()));
  loading = this.pokemonService.loading;

  constructor() {
    addIcons({ createOutline, heart, heartOutline, trashOutline });
  }

  getStatProgress(value: number): number {
    return value ? value / 255 : 0;
  }

  speakDescription(): void {
    this.voiceService.speak(this.pokemon());
  }

  goToAr(): void {
    this.arSelection.openInCamera(this.id());
  }

  toggleFavorite(): void {
    this.favorites.toggle(this.id());
  }

  edit(): void {
    this.navCtrl.navigateForward(['/pokemon-form', this.id()]);
  }

  async confirmDelete(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Pokémon',
      message: `¿Seguro que quieres eliminar a ${this.pokemon()?.name}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => this.delete() },
      ],
    });
    await alert.present();
  }

    private async delete(): Promise<void> {
    const id = this.id();
    await this.navCtrl.navigateBack('/home');
    this.pokemonService.remove(id);
  }
}