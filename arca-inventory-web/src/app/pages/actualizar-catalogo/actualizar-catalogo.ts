import { Component, NgZone, ChangeDetectorRef } from '@angular/core'; // <-- 1. Importa ChangeDetectorRef
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
    private cdr: ChangeDetectorRef // <-- 2. Inyéctalo aquí en el constructor
  ) {}

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
      this.nombreArchivo = this.archivoSeleccionado.name;
      this.cdr.detectChanges(); // Fuerza el refresco al seleccionar archivo
    }
  }

  subirFotografia(): void {
    console.log('[COMPONENTE] Botón presionado. Iniciando proceso...');
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

    this.uploadStorageService.subirDirectoS3(nombreFinalS3, this.archivoSeleccionado!).subscribe({
      next: (res) => {
        console.log('[COMPONENTE - subscribe] ¡Llegó al NEXT! Respuesta final:', res);
        this.ngZone.run(() => {
          this.procesando = false;
          this.mensaje = {
            tipo: 'success',
            texto: `¡Fotografía subida exitosamente como "${nombreFinalS3}" al S3!`
          };
          this.codigoSAP = '';
          this.archivoSeleccionado = null;
          this.nombreArchivo = '';
          
          // <-- 3. OBLIGA A ANGULAR A REDIBUJAR LA INTERFAZ INMEDIATAMENTE
          this.cdr.detectChanges(); 
        });
      },
      error: (errS3) => {
        console.error('[COMPONENTE - subscribe] ¡Cayó en el ERROR!', errS3);
        this.ngZone.run(() => {
          this.procesando = false;
          this.mensaje = { 
            tipo: 'danger', 
            texto: 'Falló la subida directa a S3. Verifica el CORS o la política pública del Bucket.' 
          };
          this.cdr.detectChanges(); // Fuerza el refresco en caso de error
        });
      }
    });
  }

  cancelar(): void {
    this.codigoSAP = '';
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
    this.mensaje = null;
    this.cdr.detectChanges(); // Fuerza el refresco al cancelar
  }
}