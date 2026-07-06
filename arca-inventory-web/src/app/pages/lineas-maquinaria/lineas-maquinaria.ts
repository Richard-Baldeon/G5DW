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
  resultados: Repuesto[] = [];
  cargando = false;
  repuestoSeleccionado: Repuesto | null = null;

  // Inyectamos NgZone además de ChangeDetectorRef
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
        // OBLIGAMOS a Angular a ejecutar esto dentro de su ciclo de vida activo
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
          
          // Forzamos el renderizado inmediato
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
  }

  seleccionarRepuesto(repuesto: Repuesto): void {
    this.repuestoSeleccionado = repuesto;
  }

  cerrarModal(): void {
    this.repuestoSeleccionado = null;
  }
}