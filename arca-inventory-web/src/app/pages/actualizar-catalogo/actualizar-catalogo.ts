import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogoService } from '../../core/services/catalogo.service';

@Component({
  selector: 'app-actualizar-catalogo',
  imports: [FormsModule],
  templateUrl: './actualizar-catalogo.html',
  styleUrl: './actualizar-catalogo.css',
})
export class ActualizarCatalogo {
  codigoSAP = '';
  archivoSeleccionado: File | null = null;
  nombreArchivo = '';
  mensaje: { tipo: 'success' | 'danger'; texto: string } | null = null;
  procesando = false;

  constructor(private catalogoService: CatalogoService) {}

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
      this.nombreArchivo = this.archivoSeleccionado.name;
    }
  }

  subirFotografia(): void {
    this.mensaje = null;
    const codigo = this.codigoSAP.trim();

    if (!codigo) {
      this.mensaje = { tipo: 'danger', texto: 'Ingresa un Código SAP.' };
      return;
    }
    if (!this.archivoSeleccionado) {
      this.mensaje = { tipo: 'danger', texto: 'Selecciona una fotografía.' };
      return;
    }

    this.procesando = true;

    this.catalogoService.existeCodigo(codigo).subscribe({
      next: (existe) => {
        this.procesando = false;
        if (!existe) {
          this.mensaje = {
            tipo: 'danger',
            texto: `¡El Código SAP "${codigo}" no existe!`
          };
        } else {
          this.mensaje = {
            tipo: 'success',
            texto: `Fotografía "${this.nombreArchivo}" asociada exitosamente al repuesto ${codigo}.`
          };
          this.codigoSAP = '';
          this.archivoSeleccionado = null;
          this.nombreArchivo = '';
        }
      },
      error: () => {
        this.procesando = false;
        this.mensaje = { tipo: 'danger', texto: 'Error al verificar el código.' };
      }
    });
  }

  cancelar(): void {
    this.codigoSAP = '';
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.mensaje = null;
  }
}
