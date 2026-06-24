export interface Repuesto {
  MATERIAL: string;
  DESCRIPCION_SAP: string;
  PRECIO: number;
  UBICACION: string;
  TEXTO_EXTENDIDO: string;
  PROVEEDOR_MAQUINA: string;
  NP_PROVEEDOR: string;
  FABRICANTE_COMPONENTE: string;
  NP_FABRICANTE: string;
  MEDIDAS: string;
  ENLACE_IMAGEN: string;
  TIENE_FOTO?: boolean;
}
