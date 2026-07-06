import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Repuesto } from '../models/repuesto.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  private readonly apiUrl = 'https://staging.d3v26duzwdz1ba.amplifyapp.com/home';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Repuesto[]> {
    return this.http.get<Repuesto[]>(this.dataUrl).pipe(
      tap(data => console.log('Data cargada:', data.length, 'registros. Ejemplo:', data[0]))
    );
  }

  buscarPorCodigo(codigo: string): Observable<Repuesto | undefined> {
    return this.getAll().pipe(
      map(repuestos => repuestos.find(r => String(r.MATERIAL).trim() === String(codigo).trim()))
    );
  }

  buscarPorProveedor(proveedor: string): Observable<Repuesto[]> {
    const regex = new RegExp(proveedor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return this.getAll().pipe(
      map(repuestos => repuestos.filter(r => r.PROVEEDOR_MAQUINA && regex.test(String(r.PROVEEDOR_MAQUINA))))
    );
  }

  existeCodigo(codigo: string): Observable<boolean> {
    return this.buscarPorCodigo(codigo).pipe(
      map(r => r !== undefined)
    );
  }

  buscarPorDescripcion(termino: string): Observable<Repuesto[]> {
    // Soporta comodines (*): cada fragmento entre asteriscos debe estar presente.
    // Comparacion robusta en minusculas para evitar problemas de mayus/minus.
    const fragmentos = String(termino)
      .toLowerCase()
      .split('*')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    return this.getAll().pipe(
      map(repuestos => repuestos.filter(r => {
        if (!r.DESCRIPCION_SAP) {
          return false;
        }
        const desc = String(r.DESCRIPCION_SAP).toLowerCase();
        return fragmentos.every(f => desc.includes(f));
      }))
    );
  }
}
