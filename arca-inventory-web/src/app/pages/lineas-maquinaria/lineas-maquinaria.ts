import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { Repuesto } from '../../core/models/repuesto.model';
import { RepuestoDetalle } from '../repuesto-detalle/repuesto-detalle';
import { Project } from '../../services/project';

interface Componente {
  nombre: string;
  filtro: string;
}

interface Linea {
  nombre: string;
  icono: string;
  componentes: Componente[];
}

@Component({
  selector: 'app-lineas-maquinaria',
  imports: [RepuestoDetalle],
  templateUrl: './lineas-maquinaria.html',
  styleUrl: './lineas-maquinaria.css',
})
export class LineasMaquinaria {
  lineas: Linea[] = [
    { nombre: 'Llenadora_Sidel', icono: 'bi-gear-wide-connected', componentes: [] },
    { nombre: 'Llenadora_Krones', icono: 'bi-cpu', componentes: [] },
    { nombre: 'Etiquetadora_Sidel', icono: 'bi-motherboard', componentes: [] },
    { nombre: 'Etiquetadora_Krones', icono: 'bi-box-seam', componentes: [] },
    { nombre: 'Paletizadora_Sidel', icono: 'bi-tools', componentes: [] },
    { nombre: 'Paletizadora_Krones', icono: 'bi-robot', componentes: [] },
  ];

  lineaAbierta: string | null = null;
  componenteActivo: string | null = null;
  resultados: any[] = []; // Cambiado temporalmente a any[] para acoplar el mapeo de propiedades del nuevo JSON
  cargando = false;
  repuestoSeleccionado: any | null = null;

  constructor(
    private projectService: Project,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  toggleLinea(nombre: string): void {
    if (this.lineaAbierta === nombre) {
      this.lineaAbierta = null;
      this.componenteActivo = null;
      this.resultados = [];
      return;
    }

    this.lineaAbierta = nombre;
    this.componenteActivo = null;
    this.resultados = [];
    this.cargando = true;

    const nombreParaApi = nombre.toLowerCase();

    this.projectService.elementos_maquina(nombreParaApi).subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          if (res && res.data) {
            this.lineas = this.lineas.map(l => {
              if (l.nombre === nombre) {
                return {
                  ...l,
                  componentes: res.data.map((item: any) => ({
                    nombre: item.elemento,
                    filtro: item.elemento.toLowerCase()
                  }))
                };
              }
              return l;
            });
          }
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al traer elementos de AWS:', err);
        this.zone.run(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  seleccionarComponente(linea: string, comp: Componente): void {
    this.componenteActivo = `${linea}-${comp.nombre}`;
    this.cargando = true;
    this.resultados = [];

    // Formateamos los dos parámetros requeridos por tu API en minúsculas
    const maquinaApi = linea.toLowerCase();
    const elementoApi = comp.nombre.toLowerCase();

    this.projectService.repuestos_maquina(maquinaApi, elementoApi).subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          if (res && res.data) {
            // Mapeamos las minúsculas de tu base de datos para que coincidan con las variables que tu HTML ya usa
            this.resultados = res.data.map((item: any) => ({
              MATERIAL: item.codigo_sap !== '-' ? item.codigo_sap : (item.numero_parte || 'No codificado'),
              DESCRIPCION_SAP: item.descripcion_extensa || item.descripcion_breve,
              UBICACION: item.marca || 'Sin marca', // Puedes adaptarlo a la propiedad de ubicación real si la agregas
              ENLACE_IMAGEN: (item.enlace_imagen && item.enlace_imagen !== 'No codificado' && item.enlace_imagen !== '111349') ? item.enlace_imagen : null
            }));
          }
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al traer repuestos de AWS:', err);
        this.zone.run(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  seleccionarRepuesto(repuesto: any): void {
    this.repuestoSeleccionado = repuesto;
  }

  cerrarModal(): void {
    this.repuestoSeleccionado = null;
  }
}