import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; // <-- Importamos tap para meter logs en medio del flujo

@Injectable({
  providedIn: 'root'
})
export class ServicesUploadStorage {
  private bucketName = 'arca-storage-s'; 
  private s3Endpoint = `https://${this.bucketName}.s3.amazonaws.com`;

  constructor(private http: HttpClient) {}

  subirDirectoS3(nombreArchivo: string, archivo: File): Observable<any> {
    const urlDestino = `${this.s3Endpoint}/${nombreArchivo}`;
    const headers = new HttpHeaders({ 'Content-Type': 'image/jpeg' });
    
    console.log('[SERVICIO S3] URL de destino armada:', urlDestino);
    console.log('[SERVICIO S3] Disparando petición HTTP PUT hacia AWS...');

    return this.http.put(urlDestino, archivo, { headers, responseType: 'text' }).pipe(
      tap({
        next: (respuesta) => console.log('[SERVICIO S3 - RxJS tap] ¡AWS S3 respondió! Cuerpo de respuesta recibido:', respuesta),
        error: (error) => console.error('[SERVICIO S3 - RxJS tap] ¡AWS S3 tiró un error en el flujo!', error),
        complete: () => console.log('[SERVICIO S3 - RxJS tap] El flujo RxJS se ha COMPLETADO.')
      })
    );
  }
}