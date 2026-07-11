import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServicesUploadStorage } from '../../services/upload-storage';

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

  constructor(
    private uploadStorageService: ServicesUploadStorage,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
      this.nombreArchivo = this.archivoSeleccionado.name;
      this.cdr.detectChanges();
    }
  }

  subirFotografia(): void {
    this.mensaje = null;
    const codigo = this.codigoSAP.trim();

    if (!codigo) {
      this.mensaje = { tipo: 'danger', texto: 'Ingresa un nombre para el archivo.' };
      return;
    }
    if (!this.archivoSeleccionado) {
      this.mensaje = { tipo: 'danger', texto: 'Selecciona una fotografía.' };
      return;
    }

    this.procesando = true;
    const nombreFinalS3 = `${codigo}.jpg`;

    console.log('[COMPONENTE] Verificando duplicados en S3...');

// ... código anterior igual
    this.uploadStorageService.verificarExisteArchivo(nombreFinalS3).subscribe({
      next: () => {
        // Si responde 200 OK, el archivo definitivamente ya existe en S3
        this.ngZone.run(() => {
          this.procesando = false;
          this.mensaje = {
            tipo: 'danger',
            texto: `El archivo "${nombreFinalS3}" ya existe en el almacenamiento. Elige otro nombre.`
          };
          this.cdr.detectChanges();
        });
      },
      error: (errExistencia) => {
        // Aceptamos tanto 404 (No encontrado) como 403 (Ocultado por S3) como señal de que el nombre está libre
        if (errExistencia.status === 404 || errExistencia.status === 403) {
          console.log(`[COMPONENTE] Estado ${errExistencia.status} recibido. Nombre libre o disponible para subida.`);
          
          // Ejecutar la subida directa
          this.uploadStorageService.subirDirectoS3(nombreFinalS3, this.archivoSeleccionado!).subscribe({
            next: () => {
              this.ngZone.run(() => {
                this.procesando = false;
                this.mensaje = {
                  tipo: 'success',
                  texto: `¡Fotografía subida exitosamente como "${nombreFinalS3}"!`
                };
                this.codigoSAP = '';
                this.archivoSeleccionado = null;
                this.nombreArchivo = '';
                this.cdr.detectChanges();
              });
            },
            error: (errSubida) => {
              console.error('Error al subir:', errSubida);
              this.ngZone.run(() => {
                this.procesando = false;
                this.mensaje = { tipo: 'danger', texto: 'Falló la subida directa del archivo.' };
                this.cdr.detectChanges();
              });
            }
          });
        } else {
          // Cualquier otro error real de red
          console.error('Error al verificar existencia:', errExistencia);
          this.ngZone.run(() => {
            this.procesando = false;
            this.mensaje = { tipo: 'danger', texto: 'Error de comunicación con el almacenamiento.' };
            this.cdr.detectChanges();
          });
        }
      }
    });
  }

  cancelar(): void {
    this.codigoSAP = '';
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.mensaje = null;
    this.cdr.detectChanges();
  }
}