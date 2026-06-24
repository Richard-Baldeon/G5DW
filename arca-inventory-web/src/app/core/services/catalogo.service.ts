import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Repuesto } from '../models/repuesto.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private readonly dataUrl = 'data/repuestos.json';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Repuesto[]> {
    return this.http.get<Repuesto[]>(this.dataUrl);
  }

  buscarPorCodigo(codigo: string): Observable<Repuesto | undefined> {
    return this.getAll().pipe(
      map(repuestos => repuestos.find(r => r.MATERIAL === codigo.trim()))
    );
  }

  buscarPorProveedor(proveedor: string): Observable<Repuesto[]> {
    const regex = new RegExp(proveedor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return this.getAll().pipe(
      map(repuestos => repuestos.filter(r => regex.test(r.PROVEEDOR_MAQUINA)))
    );
  }

  existeCodigo(codigo: string): Observable<boolean> {
    return this.buscarPorCodigo(codigo).pipe(
      map(r => r !== undefined)
    );
  }

  buscarPorDescripcion(termino: string): Observable<Repuesto[]> {
    const pattern = termino
      .trim()
      .split('*')
      .filter(p => p.length > 0)
      .map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*');
    const regex = new RegExp(pattern, 'i');
    return this.getAll().pipe(
      map(repuestos => repuestos.filter(r => regex.test(r.DESCRIPCION_SAP)))
    );
  }
}
