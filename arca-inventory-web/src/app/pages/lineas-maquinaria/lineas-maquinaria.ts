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
  resultados: any[] = []; 
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

    const maquinaApi = linea.toLowerCase();
    const elementoApi = comp.nombre.toLowerCase();

    this.projectService.repuestos_maquina(maquinaApi, elementoApi).subscribe({
      next: (res: any) => {
        this.zone.run(() => {
          this.cargando = false;
          if (res && res.data) {
            this.resultados = res.data.map((item: any) => ({
              CODIGO_SAP: item.codigo_sap !== '-' ? item.codigo_sap : (item.numero_parte || 'No codificado'),
              DESCRIPCION_BREVE: item.descripcion_breve || '',
              DESCRIPCION_EXTENSA: item.descripcion_extensa || item.descripcion_breve || '',
              ELEMENTO: item.elemento || '',
              NOMBRE_TECNICO: item.nombre_tecnico || '',
              MARCA: item.marca || 'Sin marca',
              NUMERO_PARTE: item.numero_parte || '—',
              ENLACE_IMAGEN: '' // Inicializamos vacío para que cargue la de S3 de forma asíncrona
            }));

            this.cdr.detectChanges();

            // EJECUCIÓN EN PARALELO: Buscamos la foto en S3 para cada repuesto de la lista
            this.resultados.forEach(repuesto => this.cargarImagenS3(repuesto));
          } else {
            this.cdr.detectChanges();
          }
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

  // Método privado para resolver de forma independiente la imagen de cada tarjeta en S3
  private cargarImagenS3(repuesto: any): void {
    // Si el repuesto no está codificado con código SAP, mandamos el NUMERO_PARTE a la Lambda
    const parametroDeBusqueda = repuesto.CODIGO_SAP !== 'No codificado' ? repuesto.CODIGO_SAP : repuesto.NUMERO_PARTE;

    this.projectService.storage_img(parametroDeBusqueda).subscribe({
      next: (res: any) => {
        if (res && res.body && res.body.url) {
          repuesto.ENLACE_IMAGEN = res.body.url;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error(`Error de S3 para el material ${parametroDeBusqueda}:`, err);
        this.cdr.detectChanges();
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