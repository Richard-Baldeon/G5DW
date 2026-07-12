import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ServicesUploadStorage {
  // Configuración de AWS S3
  private bucketName = 'arca-storage-s'; 
  private s3Endpoint = `https://${this.bucketName}.s3.amazonaws.com`;

  // Configuración de tu AWS API Gateway (Reemplaza con tu URL real de despliegue)
  private apiGatewayUrl = 'https://r8h3qrvwb1.execute-api.us-east-1.amazonaws.com/v1/get_verificar_material';

  constructor(private http: HttpClient) {}

  /**
   * 1. Consulta a la Lambda (vía API Gateway) si el material existe en SQL Server.
   * Como configuraste la respuesta directa sin Proxy de Lambda, el objeto llega limpio,
   * pero la Lambda devuelve un string JSON interno en la propiedad 'body'.
   */
  verificarExisteEnBaseDatos(material: string): Observable<{ existe: boolean }> {
    console.log('[SERVICIO S3] Consultando existencia de material en DB:', material);
    return this.http.get<any>(`${this.apiGatewayUrl}?material=${material}`).pipe(
      map((res: any) => {
        // Parseamos el string que viene dentro de 'body' para extraer el booleano
        const bodyParseado = JSON.parse(res.body);
        return { existe: bodyParseado.existe };
      })
    );
  }

  /**
   * 2. Consulta mediante un método HEAD si el archivo ya existe físicamente en S3.
   * Retorna 200 OK si el archivo existe, o 404/403 si el nombre está libre.
   */
  verificarExisteArchivo(nombreArchivo: string): Observable<any> {
    const urlDestino = `${this.s3Endpoint}/${nombreArchivo}`;
    console.log('[SERVICIO S3] Verificando duplicados de archivo en S3:', urlDestino);
    return this.http.head(urlDestino);
  }

  /**
   * 3. Sube el archivo binario directamente a AWS S3 mediante un método PUT.
   * Se añade responseType: 'text' para evitar que Angular intente parsear la respuesta vacía de S3.
   */
  subirDirectoS3(nombreArchivo: string, archivo: File): Observable<any> {
    const urlDestino = `${this.s3Endpoint}/${nombreArchivo}`;
    const headers = new HttpHeaders({ 'Content-Type': 'image/jpeg' });
    
    console.log('[SERVICIO S3] Disparando transferencia HTTP PUT hacia S3...');
    return this.http.put(urlDestino, archivo, { headers, responseType: 'text' }).pipe(
      tap({
        next: () => console.log('[SERVICIO S3] Transferencia completada en la red de S3.'),
        error: (err) => console.error('[SERVICIO S3] Error durante el PUT a S3:', err)
      })
    );
  }
}