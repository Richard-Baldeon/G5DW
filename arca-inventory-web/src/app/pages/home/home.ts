import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  lineasPET = [
    'Línea 1 - Sopladora KHS',
    'Línea 2 - Llenadora Krones',
    'Línea 3 - Etiquetadora B&H',
    'Línea 4 - Empacadora Lanfranchi',
    'Línea 5 - Fardos Dimac',
    'Línea 6 - Paletizador Robopac',
    'Línea 7 - Wraparound SMI',
  ];
}
