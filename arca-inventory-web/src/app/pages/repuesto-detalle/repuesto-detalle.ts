import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Repuesto } from '../../core/models/repuesto.model';

@Component({
  selector: 'app-repuesto-detalle',
  imports: [DecimalPipe],
  templateUrl: './repuesto-detalle.html',
  styleUrl: './repuesto-detalle.css',
})
export class RepuestoDetalle {
  @Input() repuesto: Repuesto | null = null;
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
}
