import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { Project } from '../../services/project';
import { RepuestoDetalleMaquina } from '../repuesto-maquina-detalle/repuesto-maquina-detalle';

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
  imports: [RepuestoDetalleMaquina],
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
            this.resultados = res.data.map((item: any) => ({
              // Mantén tus nombres en mayúsculas idénticos a tu interfaz:
              CODIGO_SAP: item.codigo_sap !== '-' ? item.codigo_sap : (item.numero_parte || 'No codificado'),
              DESCRIPCION_BREVE: item.descripcion_breve || '',
              DESCRIPCION_EXTENSA: item.descripcion_extensa || item.descripcion_breve || '',
              ELEMENTO: item.elemento || '',
              NOMBRE_TECNICO: item.nombre_tecnico || '',
              MARCA: item.marca || 'Sin marca',
              NUMERO_PARTE: item.numero_parte || '—',
              ENLACE_IMAGEN: item.enlace_imagen // Deja tu lógica de imagen idéntica a como la tenías
            }));
          }
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      // ... el resto del error se queda igual
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
  transformarEnlaceDrive(url: string): string {
  if (!url || url === '-') return '';
  // Si el enlace contiene la estructura clásica de previsualización de Drive, extraemos el ID
  if (url.includes('drive.google.com')) {
    const match = url.match(/(?:id=|\/d\/|id\s*:\s*)([\w-]+)/);
    if (match && match[1]) {
      // Formato de renderizado alternativo optimizado para saltar restricciones
      return `https://lh3.googleusercontent.com/d/${match[1]}=w400`;
    }
  }
  return url;
}
}