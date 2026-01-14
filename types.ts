
export enum MovementType {
  INGRESO = 'INGRESO',
  GASTO = 'GASTO'
  // INVERSION deprecado - todos los préstamos ahora se registran como GASTO
  // Los retornos de dinero se registran como INGRESO
}

export enum MovementStatus {
  PENDIENTE_CORTE = 'PENDIENTE_CORTE',
  EN_CURSO = 'EN_CURSO',
  ARCHIVADO = 'ARCHIVADO'
}

export interface Movement {
  id: string;
  type: MovementType;
  category?: string; // Campo para categoría (ej: "Préstamo", "Venta", etc.)
  amount: number;
  description: string;
  responsible: string;
  authorization: string; // Fijo: Josué M.
  date: string;
  status: MovementStatus;
  cutId?: string; // ID vinculado al corte de caja
}

// DEPRECADO: Inversion ya no se usa. Los préstamos son GASTO, los retornos son INGRESO
export interface Inversion extends Movement {
  tasaInteres?: number;
  plazoDias?: number;
  fechaVencimiento?: string;
  estado: 'ACTIVA' | 'LIQUIDADA';
  montoRetornado?: number;
  ganancia?: number;
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
  
  // Cálculos derivados
  balanceCalculado: number; // Saldo_Inicial + Ingresos - Egresos
  conteoFisico: number;
  diferencia: number; // conteoFisico - balanceCalculado
  
  // Datos de auditoría
  movements: Movement[];
  
  // Ajustes si es necesario
  ajuste?: {
    tipo: 'SOBRANTE' | 'FALTANTE';
    monto: number;
    descripcion: string;
  };
}
