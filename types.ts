
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
  /** Total amount returned from the investment */
  montoRetorno?: number;
  /** Profit/loss calculated as (montoRetorno - initial amount). Negative values indicate losses. */
  ganancia?: number;
  /** Date when the investment return was completed */
  fechaRetorno?: string;
}

export interface VaultCount {
  bills: Record<string, number>;
  coins: Record<string, number>;
}

export interface CorteSummary {
  id: string;
  date: string;
  // Saldos iniciales
  saldoInicial: number;
  
  // Flujo de efectivo
  ingresosTotal: number;
  egresosTotal: number;
  inversionesRealizadas: number;
  desinversionesRetornadas: number;
  
  // Cálculos derivados
  balanceCalculado: number; // Saldo_Inicial + Ingresos - Egresos - Inversiones + Desinversiones
  conteoFisico: number;
  diferencia: number; // conteoFisico - balanceCalculado
  
  // Patrimonio
  patrimonio: {
    efectivoDisponible: number; // balanceCalculado
    inversionesActivas: number; // Total en inversiones activas
    capitalTotal: number; // efectivo + inversiones
  };
  
  // Datos de auditoría
  gastosTotal?: number; // Para compatibilidad
  balanceSistema?: number; // Para compatibilidad
  movements: Movement[];
  
  // Ajustes si es necesario
  ajuste?: {
    tipo: 'SOBRANTE' | 'FALTANTE';
    monto: number;
    descripcion: string;
  };
}
