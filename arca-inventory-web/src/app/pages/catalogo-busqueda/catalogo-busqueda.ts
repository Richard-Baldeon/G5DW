import { Component, ChangeDetectorRef } from '@angular/core';
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

  constructor(
    private catalogoService: CatalogoService,
    private cdr: ChangeDetectorRef
  ) {}

  // 1. BÚSQUEDA POR CÓDIGO SAP
  buscarPorCodigo(): void {
    const codigo = this.codigoSAP.trim();
    if (!codigo) return;

    this.buscando = true;
    this.mensajeError = '';
    this.resultados = []; 
    this.repuestoSeleccionado = null;

    this.catalogoService.buscarPorCodigo(codigo).subscribe({
      next: (repuesto) => {
        if (repuesto) {
          this.resultados = [repuesto];
          // Tu Lambda ya resuelve las mayúsculas/minúsculas de S3 directamente
          this.cargarImagenS3(repuesto);
        } else {
          this.buscando = false;
          this.mensajeError = `¡El Código SAP "${codigo}" no fue encontrado!`;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.buscando = false;
        this.mensajeError = 'Error al consultar el catálogo.';
        this.cdr.detectChanges();
      }
    });
  }

  // 2. BÚSQUEDA POR DESCRIPCIÓN (TEXTO MULTIPLE)
  buscarPorDescripcion(): void {
    const termino = this.terminoDescripcion.trim();
    if (!termino) return;

    this.buscando = true;
    this.mensajeError = '';
    this.resultados = [];

    this.catalogoService.buscarPorDescripcion(termino).subscribe({
      next: (listaRepuestos) => {
        this.buscando = false;
        if (listaRepuestos.length === 0) {
          this.mensajeError = `No se encontraron resultados para "${termino}".`;
          this.cdr.detectChanges();
          return;
        }

        this.resultados = listaRepuestos;
        this.cdr.detectChanges();

        // AQUÍ ESTÁ EL TRUCO: Disparamos la carga de S3 para cada repuesto en paralelo.
        // Cada tarjeta se actualizará individualmente conforme AWS responda.
        this.resultados.forEach(repuesto => this.cargarImagenS3(repuesto));
      },
      error: () => {
        this.buscando = false;
        this.mensajeError = 'Error al consultar el catálogo.';
        this.cdr.detectChanges();
      }
    });
  }

  // MÉTODO UNIFICADO: Carga la imagen desde S3 usando tu Lambda optimizada
  private cargarImagenS3(repuesto: Repuesto): void {
    this.catalogoService.storage_img(repuesto.MATERIAL).subscribe({
      next: (res) => {
        if (res && res.body && res.body.url) {
          repuesto.ENLACE_IMAGEN = res.body.url;
          // Forzamos el renderizado de la tarjeta que acaba de recibir su link de S3
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(`No se pudo cargar la imagen para ${repuesto.MATERIAL}`, err);
        repuesto.ENLACE_IMAGEN = ''; // Asegura que muestre el icono por defecto en la grilla
        this.cdr.detectChanges();
      }
    });
  }

  // 3. SELECCIONAR REPUESTO (ABRIR DETALLE)
  seleccionarRepuesto(repuesto: Repuesto): void {
    // Como las imágenes se cargan en la grilla inmediatamente, 
    // cuando abres el detalle ya tiene la URL firmada lista.
    this.repuestoSeleccionado = repuesto;
  }

  cerrarModal(): void {
    this.repuestoSeleccionado = null;
  }

  limpiarCodigo(): void {
    this.codigoSAP = '';
    this.resultados = [];
    this.repuestoSeleccionado = null;
    this.mensajeError = '';
    this.cdr.detectChanges();
  }

  limpiarDescripcion(): void {
    this.terminoDescripcion = '';
    this.resultados = [];
    this.mensajeError = '';
    this.cdr.detectChanges();
  }
}