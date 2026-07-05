import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Repuesto } from '../models/repuesto.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private readonly baseUrl = 'https://h6120959l8.execute-api.us-east-1.amazonaws.com/v1';

  constructor(private http: HttpClient) {}

  // Función interna para mapear las minúsculas de AWS a las mayúsculas que usa tu App
  private mapearARepuesto(item: any): Repuesto {
    return {
      MATERIAL: item.material || '',
      DESCRIPCION_SAP: item.descripcion_sap || '',
      PRECIO: item.precio ? parseFloat(item.precio) : 0,
      UBICACION: item.ubicacion || '',
      TEXTO_EXTENDIDO: item.texto_extendido || '',
      PROVEEDOR_MAQUINA: item.proveedor_maquina || '',
      NP_PROVEEDOR: item.np_proveedor || '',
      FABRICANTE_COMPONENTE: item.fabricante_componente || '',
      NP_FABRICANTE: item.np_fabricante || '',
      MEDIDAS: item.medidas || '',
      ENLACE_IMAGEN: item.enlace_imagen || '',
      TIENE_FOTO: item.tiene_foto ?? false
    };
  }

  // 1. Búsqueda por Código SAP
  buscarPorCodigo(codigo: string): Observable<Repuesto | undefined> {
    const codigoLimpio = codigo.trim();
    return this.http.get<any>(`${this.baseUrl}/catalogosap?material=${codigoLimpio}`).pipe(
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
    return this.http.get<any>(`${this.baseUrl}/catalogotexto?descripcion_sap=${terminoLimpio}`).pipe(
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
}