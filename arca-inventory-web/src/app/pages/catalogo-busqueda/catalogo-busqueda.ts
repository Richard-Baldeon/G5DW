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
          // Buscamos su imagen en S3 inmediatamente antes de mostrarlo
          this.cargarImagenS3YAgregarALista(repuesto);
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

  buscarPorDescripcion(): void {
    const termino = this.terminoDescripcion.trim();
    if (!termino) return;

    this.buscando = true;
    this.mensajeError = '';
    this.resultados = [];

    this.catalogoService.buscarPorDescripcion(termino).subscribe({
      next: (listaRepuestos) => {
        if (listaRepuestos.length === 0) {
          this.buscando = false;
          this.mensajeError = `No se encontraron resultados para "${termino}".`;
          this.cdr.detectChanges();
          return;
        }

        // Para las descripciones, guardamos la lista e intentamos resolver 
        // las imágenes bajo demanda cuando el usuario abra el detalle, 
        // o las cargamos aquí si son pocos resultados.
        this.resultados = listaRepuestos;
        this.buscando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.buscando = false;
        this.mensajeError = 'Error al consultar el catálogo.';
        this.cdr.detectChanges();
      }
    });
  }

  // Método intermedio para buscar la imagen (.JPG o .jpg) en S3
  private cargarImagenS3YAgregarALista(repuesto: Repuesto): void {
    const codigoBase = repuesto.MATERIAL.trim();

    // Intento 1: .JPG
    this.catalogoService.storage_img(`${codigoBase}.JPG`).subscribe({
      next: (res) => {
        this.buscando = false;
        if (res && res.body && res.body.url) {
          repuesto.ENLACE_IMAGEN = res.body.url;
        } else {
          // Intento 2: .jpg (minúscula) si el primero no devolvió URL
          this.resolverMinuscula(repuesto, codigoBase);
          return;
        }
        this.resultados = [repuesto];
        this.cdr.detectChanges();
      },
      error: () => {
        // Intento 2: .jpg si el primero falló por red/404
        this.resolverMinuscula(repuesto, codigoBase);
      }
    });
  }

  private resolverMinuscula(repuesto: Repuesto, codigoBase: string): void {
    this.catalogoService.storage_img(`${codigoBase}.jpg`).subscribe({
      next: (res) => {
        this.buscando = false;
        if (res && res.body && res.body.url) {
          repuesto.ENLACE_IMAGEN = res.body.url;
        } else {
          repuesto.ENLACE_IMAGEN = ''; // Sin imagen si ambos fallan
        }
        this.resultados = [repuesto];
        this.cdr.detectChanges();
      },
      error: () => {
        this.buscando = false;
        repuesto.ENLACE_IMAGEN = ''; 
        this.resultados = [repuesto];
        this.cdr.detectChanges();
      }
    });
  }

  // Al seleccionar, si es búsqueda por descripción, cargamos su S3 en ese instante
  seleccionarRepuesto(repuesto: Repuesto): void {
    // Si ya tiene la URL de S3 (porque se buscó por código), lo abrimos directo
    if (repuesto.ENLACE_IMAGEN && repuesto.ENLACE_IMAGEN.includes('amazonaws.com')) {
      this.repuestoSeleccionado = repuesto;
      return;
    }

    this.buscando = true;
    const codigoBase = repuesto.MATERIAL.trim();

    // En tu archivo catalogo-busqueda.ts ahora el flujo es directo y limpio:
    this.catalogoService.storage_img(repuesto.MATERIAL).subscribe({
      next: (res) => {
        this.buscando = false;
        if (res && res.body && res.body.url) {
          repuesto.ENLACE_IMAGEN = res.body.url;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.buscando = false;
        console.error("Error al traer la imagen de S3", err);
        this.cdr.detectChanges();
      }
    });
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