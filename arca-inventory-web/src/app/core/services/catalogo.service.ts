import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Repuesto } from '../models/repuesto.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private readonly baseUrl = 'https://r8h3qrvwb1.execute-api.us-east-1.amazonaws.com/v1';

  constructor(private http: HttpClient) {}

  // Función interna para mapear las minúsculas de AWS a las mayúsculas que usa tu App
  private mapearARepuesto(item: any): Repuesto {
    return {
      MATERIAL: item.material || '',
      DESCRIPCION_SAP: item.descripcionSap || '',
      PRECIO: item.precio ? parseFloat(item.precio) : 0,
      UBICACION: item.ubicacion || '',
      TEXTO_EXTENDIDO: item.textoExtendido || '',
      PROVEEDOR_MAQUINA: item.proveedorMaquina || '',
      NP_PROVEEDOR: item.npProveedor || '',
      FABRICANTE_COMPONENTE: item.fabricanteComponente || '',
      NP_FABRICANTE: item.np_fabricante || '',
      MEDIDAS: item.medidas || '',
      ENLACE_IMAGEN: item.enlaceImagen || '',
      TIENE_FOTO: item.tiene_foto ?? false
    };
  }

  // 1. Búsqueda por Código SAP
  buscarPorCodigo(codigo: string): Observable<Repuesto | undefined> {
    const codigoLimpio = codigo.trim();
    return this.http.get<any>(`${this.baseUrl}/catalogo_sap?material=${codigoLimpio}`).pipe(
      map(res => {
        // Extraemos el arreglo de 'data' si viene envuelto
        const lista = res && res.data ? res.data : (Array.isArray(res) ? res : []);
        return lista.length > 0 ? this.mapearARepuesto(lista[0]) : undefined;
      })
    );
  }

  // 2. Búsqueda por Descripción
  buscarPorDescripcion(termino: string): Observable<Repuesto[]> {
    const terminoLimpio = termino.trim();
    return this.http.get<any>(`${this.baseUrl}/catalogo_txt?descripcionSap=${terminoLimpio}`).pipe(
      map(res => {
        // Extraemos el arreglo de 'data' si viene envuelto
        const lista = res && res.data ? res.data : (Array.isArray(res) ? res : []);
        return lista.map((item: any) => this.mapearARepuesto(item));
      })
    );
  }

  // 3. Verificar Existencia
  existeCodigo(codigo: string): Observable<boolean> {
    return this.buscarPorCodigo(codigo).pipe(
      map(repuesto => repuesto !== undefined)
    );
  }
  // Agrega este método dentro de tu clase CatalogoService

storage_img(param: string): Observable<any> {
  const codigoLimpio = param.trim();
  return this.http.get<any>(
    `${this.baseUrl}/getstorage?imagen=${codigoLimpio}`,
    { responseType: 'json' }
  );
}
}