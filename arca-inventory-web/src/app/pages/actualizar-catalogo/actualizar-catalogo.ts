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

  console.log('[COMPONENTE] Paso 1: Validando existencia del material en la Base de Datos...');

  // PASO 1: Validar contra la Lambda si el material existe en SQL Server
  this.uploadStorageService.verificarExisteEnBaseDatos(codigo).subscribe({
    next: (resDB) => {
      
      if (!resDB.existe) {
        // Si el material NO existe en la base de datos, frenamos el proceso de inmediato
        this.ngZone.run(() => {
          this.procesando = false;
          this.mensaje = {
            tipo: 'danger',
            texto: `El material con código "${codigo}" no existe en la base de datos. No se puede subir la fotografía.`
          };
          this.cdr.detectChanges();
        });
        return;
      }

      console.log('[COMPONENTE] Paso 2: El material existe. Validando duplicados de foto en S3...');

      // PASO 2: Si el material existe, verificamos que no tenga una foto subida previamente
      this.uploadStorageService.verificarExisteArchivo(nombreFinalS3).subscribe({
        next: () => {
          // Si responde 200 OK, significa que la foto ya existe en el almacenamiento
          this.ngZone.run(() => {
            this.procesando = false;
            this.mensaje = {
              tipo: 'danger',
              texto: `La fotografía para el código "${nombreFinalS3}" ya existe en el almacenamiento.`
            };
            this.cdr.detectChanges();
          });
        },
        error: (errExistencia) => {
          // Si da 404 o 403, significa que el espacio está libre para subir la foto
          if (errExistencia.status === 404 || errExistencia.status === 403) {
            
            console.log('[COMPONENTE] Paso 3: Todo en orden. Procediendo con la subida directa a S3...');

            // PASO 3: Subida final del archivo binario a S3
            this.uploadStorageService.subirDirectoS3(nombreFinalS3, this.archivoSeleccionado!).subscribe({
              next: () => {
                this.ngZone.run(() => {
                  this.procesando = false;
                  this.mensaje = {
                    tipo: 'success',
                    texto: `¡Fotografía vinculada y subida exitosamente como "${nombreFinalS3}"!`
                  };
                  this.codigoSAP = '';
                  this.archivoSeleccionado = null;
                  this.nombreArchivo = '';
                  this.cdr.detectChanges();
                });
              },
              error: (errSubida) => {
                console.error('Error en la transferencia a S3:', errSubida);
                this.interfazError('Falló la transferencia de la imagen hacia el almacenamiento S3.');
              }
            });

          } else {
            this.interfazError('Error al intentar verificar los archivos duplicados en S3.');
          }
        }
      });

    },
    error: (errDB) => {
      console.error('Error al consultar la API de la Lambda:', errDB);
      this.interfazError('No se pudo establecer comunicación con la API de validación de materiales.');
    }
  });
}

// Helper para centralizar el manejo visual de errores
private interfazError(texto: string): void {
  this.ngZone.run(() => {
    this.procesando = false;
    this.mensaje = { tipo: 'danger', texto };
    this.cdr.detectChanges();
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