import { Component } from '@angular/core';
import { CatalogoService } from '../../core/services/catalogo.service';
import { Repuesto } from '../../core/models/repuesto.model';
import { RepuestoDetalle } from '../repuesto-detalle/repuesto-detalle';

interface Componente {
  nombre: string;
  filtro: string;
}

interface Linea {
  nombre: string;
  icono: string;
  componentes: Componente[];
}

@Component({
  selector: 'app-lineas-maquinaria',
  imports: [RepuestoDetalle],
  templateUrl: './lineas-maquinaria.html',
  styleUrl: './lineas-maquinaria.css',
})
export class LineasMaquinaria {
  lineas: Linea[] = [
    {
      nombre: 'Llenadora_Sidel', icono: 'bi-gear-wide-connected',
      componentes: [
        { nombre: 'Alineador', filtro: 'alineador' },
        { nombre: 'Bomba', filtro: 'bomba' },
        { nombre: 'Sensores', filtro: 'sensor' },
        { nombre: 'Servomotores', filtro: 'servo' },
        { nombre: 'Borneras', filtro: 'bornera' },
      ]
    },
    {
      nombre: 'Llenadora_Krones', icono: 'bi-cpu',
      componentes: [
        { nombre: 'Válvulas', filtro: 'valvula' },
        { nombre: 'Rodamientos', filtro: 'rodamiento' },
        { nombre: 'Sensores', filtro: 'sensor' },
        { nombre: 'Cilindros', filtro: 'cilindro' },
        { nombre: 'Correas', filtro: 'correa' },
      ]
    },
    {
      nombre: 'Etiquetadora_Sidel', icono: 'bi-motherboard',
      componentes: [
        { nombre: 'Bomba', filtro: 'bomba' },
        { nombre: 'Filtros', filtro: 'filtro' },
        { nombre: 'Engranajes', filtro: 'engranaje' },
        { nombre: 'Motores', filtro: 'motor' },
        { nombre: 'Sensores', filtro: 'sensor' },
      ]
    },
    {
      nombre: 'Etiquetadora_Krones', icono: 'bi-box-seam',
      componentes: [
        { nombre: 'Cadenas', filtro: 'cadena' },
        { nombre: 'Guías', filtro: 'guia' },
        { nombre: 'Servomotores', filtro: 'servo' },
        { nombre: 'Borneras', filtro: 'bornera' },
      ]
    },
    {
      nombre: 'Paletizadora_Sidel', icono: 'bi-tools',
      componentes: [
        { nombre: 'Cuchillas', filtro: 'cuchilla' },
        { nombre: 'Rodamientos', filtro: 'rodamiento' },
        { nombre: 'Sensores', filtro: 'sensor' },
      ]
    },
    {
      nombre: 'Paletizadora_Krones', icono: 'bi-robot',
      componentes: [
        { nombre: 'Motores', filtro: 'motor' },
        { nombre: 'Cilindros', filtro: 'cilindro' },
        { nombre: 'Sensores', filtro: 'sensor' },
      ]
    },
  ];

  lineaAbierta: string | null = null;
  componenteActivo: string | null = null;
  resultados: Repuesto[] = [];
  cargando = false;
  repuestoSeleccionado: Repuesto | null = null;

  constructor(private catalogoService: CatalogoService) {}

  toggleLinea(nombre: string): void {
    if (this.lineaAbierta === nombre) {
      this.lineaAbierta = null;
      this.componenteActivo = null;
      this.resultados = [];
    } else {
      this.lineaAbierta = nombre;
      this.componenteActivo = null;
      this.resultados = [];
    }
  }

  seleccionarComponente(linea: string, comp: Componente): void {
    this.componenteActivo = `${linea}-${comp.nombre}`;
    this.cargando = true;
    this.resultados = [];

    this.catalogoService.buscarPorDescripcion(`*${comp.filtro}*`).subscribe({
      next: (items) => {
        this.resultados = items.slice(0, 50);
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  seleccionarRepuesto(repuesto: Repuesto): void {
    this.repuestoSeleccionado = repuesto;
  }

  cerrarModal(): void {
    this.repuestoSeleccionado = null;
  }
}
