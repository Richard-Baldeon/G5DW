import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RepuestoMaquina } from '../../core/models/repuesto_maquina.model';

@Component({
  selector: 'app-repuesto-detalle',
  templateUrl: './repuesto-maquina-detalle.html',
  styleUrl: './repuesto-maquina-detalle.css',
})
export class RepuestoDetalleMaquina {
  @Input() repuesto: RepuestoMaquina | null = null;
  @Output() cerrar = new EventEmitter<void>();

  copiadoField: string | null = null;

  cerrarModal(): void {
    this.cerrar.emit();
  }

  copiar(valor: string, campo: string): void {
    navigator.clipboard.writeText(valor);
    this.copiadoField = campo;
    setTimeout(() => this.copiadoField = null, 1500);
  }
  transformarEnlaceDrive(url: string): string {
    if (!url || url === '-') return '';
    if (url.includes('drive.google.com')) {
      const match = url.match(/(?:id=|\/d\/|id\s*:\s*)([\w-]+)/);
      if (match && match[1]) {
        // En el modal usamos un ancho un poco mayor (w600) para que tenga mejor resolución
        return `https://lh3.googleusercontent.com/d/${match[1]}=w600`;
      }
    }
    return url;
  }
}
