import { Component, input } from '@angular/core';

/** Parte superior de la Pokédex: lente azul + luces + título. */
@Component({
  selector: 'app-dex-top',
  standalone: true,
  template: `
    <div class="dex-top">
      <div class="lens"><span class="shine"></span></div>
      <div class="leds"><i class="led r"></i><i class="led y"></i><i class="led g"></i></div>
      <div class="titles">
        <strong>{{ title() }}</strong>
        @if (subtitle()) {
          <small>{{ subtitle() }}</small>
        }
      </div>
    </div>
  `,
  styleUrl: './dex-top.component.scss',
})
export class DexTopComponent {
  readonly title = input('Pokédex');
  readonly subtitle = input('');
}
