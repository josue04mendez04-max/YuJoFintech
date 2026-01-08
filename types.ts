
export enum MovementType {
  INGRESO = 'INGRESO',
  GASTO = 'GASTO',
  INVERSION = 'INVERSION'
}

export enum InversionStatus {
  ACTIVA = 'ACTIVA',
  PENDIENTE_RETORNO = 'PENDIENTE_RETORNO',
  COMPLETADA = 'COMPLETADA'
}

export enum MovementStatus {
  PENDIENTE_CORTE = 'PENDIENTE_CORTE',
  EN_CURSO = 'EN_CURSO',
  ARCHIVADO = 'ARCHIVADO'
}

export interface Movement {
  id: string;
  type: MovementType;
  category?: string; // Campo para compatibilidad con Sheets
  amount: number;
  description: string;
  responsible: string;
  authorization: string; // Fijo: Josué M.
  date: string;
  status: MovementStatus;
  cutId?: string; // ID vinculado al corte de caja
}

export interface Inversion {
  id: string;
  monto: number;
  descripcion: string;
  tipo: 'Proyecto' | 'Compra' | 'Mejora' | 'Otro';
  responsable: string;
  fechaInicio: string;
  fechaEstimadaRetorno?: string;
  status: InversionStatus;
  notas?: string;
  timestamp?: string;
}

export interface VaultCount {
  bills: Record<string, number>;
  coins: Record<string, number>;
}

export interface CorteSummary {
  id: string;
  date: string;
  ingresosTotal: number;
  gastosTotal: number;
  balanceSistema: number;
  conteoFisico: number;
  diferencia: number;
  movements: Movement[];
}
