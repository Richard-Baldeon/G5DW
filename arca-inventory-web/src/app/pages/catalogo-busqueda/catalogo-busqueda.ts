import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CatalogoService } from '../../core/services/catalogo.service';
import { Repuesto } from '../../core/models/repuesto.model';
import { RepuestoDetalle } from '../repuesto-detalle/repuesto-detalle';

@Component({
  selector: 'app-catalogo-busqueda',
  imports: [FormsModule, DecimalPipe, RepuestoDetalle],
  templateUrl: './catalogo-busqueda.html',
  styleUrl: './catalogo-busqueda.css',
})
export class CatalogoBusqueda {
  modoActivo: 'codigo' | 'descripcion' = 'codigo';

  codigoSAP = '';
  terminoDescripcion = '';

  repuestoSeleccionado: Repuesto | null = null;
  resultados: Repuesto[] = [];
  buscando = false;
  mensajeError = '';

  constructor(private catalogoService: CatalogoService) {}

buscarPorCodigo(): void {
    const codigo = this.codigoSAP.trim();
    if (!codigo) return;

    this.buscando = true;
    this.mensajeError = '';
    this.resultados = []; // Limpiamos búsquedas previas
    this.repuestoSeleccionado = null;

    this.catalogoService.buscarPorCodigo(codigo).subscribe({
      next: (repuesto) => {
        this.buscando = false;
        if (repuesto) {
          // Guardamos el repuesto en el arreglo para que pinte la tarjeta en el HTML
          this.resultados = [repuesto]; 
        } else {
          this.mensajeError = `¡El Código SAP "${codigo}" no fue encontrado!`;
        }
      },
      error: () => {
        this.buscando = false;
        this.mensajeError = 'Error al consultar el catálogo.';
      }
    });
  }

  buscarPorDescripcion(): void {
    const termino = this.terminoDescripcion.trim();
    if (!termino) return;

    this.buscando = true;
    this.mensajeError = '';
    this.resultados = [];

    this.catalogoService.buscarPorDescripcion(termino).subscribe({
      next: (resultados) => {
        this.buscando = false;
        this.resultados = resultados;
        if (resultados.length === 0) {
          this.mensajeError = `No se encontraron resultados para "${termino}".`;
        }
      },
      error: () => {
        this.buscando = false;
        this.mensajeError = 'Error al consultar el catálogo.';
      }
    });
  }

  seleccionarRepuesto(repuesto: Repuesto): void {
    this.repuestoSeleccionado = repuesto;
  }

  cerrarModal(): void {
    this.repuestoSeleccionado = null;
  }

  limpiarCodigo(): void {
    this.codigoSAP = '';
    this.repuestoSeleccionado = null;
    this.mensajeError = '';
  }

  limpiarDescripcion(): void {
    this.terminoDescripcion = '';
    this.resultados = [];
    this.mensajeError = '';
  }
}
