import { Component, inject } from '@angular/core';
import { IonBadge, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { camera, heart, home } from 'ionicons/icons';
import { FavoritesService } from '../services/favorites.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" class="dex-tabbar">
        <ion-tab-button tab="home">
          <ion-icon name="home"></ion-icon>
          <ion-label>Inicio</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="camara">
          <ion-icon name="camera"></ion-icon>
          <ion-label>Cámara</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="favoritos">
          <ion-icon name="heart"></ion-icon>
          <ion-label>Favoritos</ion-label>
          @if (favorites.count() > 0) {
            <ion-badge color="danger">{{ favorites.count() }}</ion-badge>
          }
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {
  protected favorites = inject(FavoritesService);

  constructor() {
    addIcons({ camera, heart, home });
  }
}
