import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    // Las tres vistas principales viven dentro de las pestañas (Inicio · Cámara · Favoritos).
    path: '',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: 'home', loadComponent: () => import('./home/home.page').then((m) => m.HomePage) },
      { path: 'camara', loadComponent: () => import('./camara/camara.page').then((m) => m.CamaraPage) },
      { path: 'favoritos', loadComponent: () => import('./favoritos/favoritos.page').then((m) => m.FavoritosPage) },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  {
    path: 'pokemon-detail/:id',
    loadComponent: () => import('./pokemon-detail/pokemon-detail.page').then((m) => m.PokemonDetailPage),
  },
  {
    path: 'pokemon-form',
    loadComponent: () => import('./pokemon-form/pokemon-form.page').then((m) => m.PokemonFormPage),
  },
  {
    path: 'pokemon-form/:id',
    loadComponent: () => import('./pokemon-form/pokemon-form.page').then((m) => m.PokemonFormPage),
  },
  // Compatibilidad con enlaces antiguos a la vista AR.
  { path: 'pokemon-ar/:id', redirectTo: 'camara' },
];
