import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServicesUploadStorage {
  private bucketName = 'arca-storage-s'; 
  private s3Endpoint = `https://${this.bucketName}.s3.amazonaws.com`;

  constructor(private http: HttpClient) {}

  /**
   * Consulta mediante HEAD si el archivo ya existe en S3
   */
  verificarExisteArchivo(nombreArchivo: string): Observable<any> {
    const urlDestino = `${this.s3Endpoint}/${nombreArchivo}`;
    console.log('[SERVICIO S3] Verificando existencia en:', urlDestino);
    // Usamos HEAD porque solo nos interesa el estado de la respuesta (200 o 404), no descargar el archivo
    return this.http.head(urlDestino);
  }

  subirDirectoS3(nombreArchivo: string, archivo: File): Observable<any> {
    const urlDestino = `${this.s3Endpoint}/${nombreArchivo}`;
    const headers = new HttpHeaders({ 'Content-Type': 'image/jpeg' });
    
    return this.http.put(urlDestino, archivo, { headers, responseType: 'text' }).pipe(
      tap({
        complete: () => console.log('[SERVICIO S3] Subida completada con éxito.')
      })
    );
  }
}