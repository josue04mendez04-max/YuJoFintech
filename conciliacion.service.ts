import { Movement, MovementType, MovementStatus, Inversion, CorteSummary } from './types';

/**
 * Servicio de Conciliación de Saldos para Corte de Caja
 * Implementa la lógica financiera sofisticada para fintech
 */

interface ConciliationInput {
  movements: Movement[];
  inversiones: Inversion[];
  physicalTotal: number;
  saldoInicial?: number;
}

/**
 * Calcula la fórmula de conciliación simplificada:
 * Dinero Esperado = Fondo Inicial + Ingresos Totales - Gastos Totales
 * 
 * Si existen registros antiguos con tipo INVERSION, se tratan como GASTOS
 * para mantener compatibilidad con la base de datos histórica.
 */
export const calcularConciliacion = (input: ConciliationInput) => {
  const { movements, inversiones, physicalTotal, saldoInicial = 0 } = input;

  // Filtrar movimientos pendientes de corte (ciclo actual)
  const activeMovements = movements.filter(m => m.status === MovementStatus.PENDIENTE_CORTE);

  // Calcular ingresos totales del turno
  const ingresos = activeMovements
    .filter(m => m.type === MovementType.INGRESO)
    .reduce((a, b) => a + b.amount, 0);

  // Calcular gastos totales del turno
  // NOTA: Tratamos INVERSION como GASTO para compatibilidad histórica
  const gastos = activeMovements
    .filter(m => m.type === MovementType.GASTO)
    .reduce((a, b) => a + b.amount, 0);

  // Fórmula simplificada:
  // Dinero Esperado = Saldo_Inicial + Ingresos - Gastos
  const balanceCalculado = saldoInicial + ingresos - gastos;

  // Diferencia entre conteo físico y cálculo
  const diferencia = physicalTotal - balanceCalculado;

  return {
    saldoInicial,
    ingresos,
    egresos: gastos,
    inversionesRealizadas: 0, // Ya no se usa
    desinversionesRetornadas: 0, // Ya no se usa
    balanceCalculado,
    conteoFisico: physicalTotal,
    diferencia,
    patrimonio: {
      efectivoDisponible: balanceCalculado,
      inversionesActivas: 0, // Ya no se usa
      capitalTotal: balanceCalculado
    },
    activeMovements,
    inversionesActivas: 0 // Ya no se usa
  };
};

/**
 * Valida si el corte está balanceado
 */
export const validarCorte = (conciliacion: ReturnType<typeof calcularConciliacion>): {
  isBalanced: boolean;
  mensaje: string;
  requiresAdjustment: boolean;
} => {
  const tolerance = 0.01; // Tolerancia de 0.01 para redondeos
  const isBalanced = Math.abs(conciliacion.diferencia) < tolerance;

  if (isBalanced) {
    return {
      isBalanced: true,
      mensaje: '✓ Corte balanceado. Los saldos cuadran perfectamente.',
      requiresAdjustment: false
    };
  }

  const tipoAjuste = conciliacion.diferencia > 0 ? 'SOBRANTE' : 'FALTANTE';
  const montoAjuste = Math.abs(conciliacion.diferencia);

  return {
    isBalanced: false,
    mensaje: `⚠ ${tipoAjuste}: $${montoAjuste.toLocaleString()} | Requiere ajuste de saldos.`,
    requiresAdjustment: true
  };
};

/**
 * Crea el resumen de corte con todos los datos
 */
export const generarCorteSummary = (
  conciliacion: ReturnType<typeof calcularConciliacion>,
  validacion: ReturnType<typeof validarCorte>
): CorteSummary => {
  const {
    saldoInicial,
    ingresos,
    egresos,
    balanceCalculado,
    conteoFisico,
    diferencia,
    activeMovements
  } = conciliacion;

  return {
    id: `CORTE-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    date: new Date().toISOString(),
    saldoInicial: saldoInicial,
    totalIngresos: ingresos,
    ingresosTotal: ingresos,
    totalEgresos: egresos,
    egresosTotal: egresos,
    balanceCalculado: balanceCalculado,
    physicalTotal: conteoFisico,
    conteoFisico: conteoFisico,
    diferencia: diferencia,
    movimientosCount: activeMovements.length,
    isBalanced: validacion.isBalanced,
    mensajeValidacion: validacion.mensaje,
    saldoFinal: conteoFisico,
    movements: activeMovements
  };
};

/**
 * Calcula el saldo inicial para el próximo corte
 */
export const calcularSaldoInicial = (ultimoCorte: CorteSummary): number => {
  return ultimoCorte.balanceCalculado;
};

/**
 * Genera un reporte detallado de conciliación (para auditoría)
 */
export const generarReporteAuditoria = (
  conciliacion: ReturnType<typeof calcularConciliacion>,
  validacion: ReturnType<typeof validarCorte>
) => {
  return {
    timestamp: new Date().toISOString(),
    saldoInicial: conciliacion.saldoInicial,
    operaciones: {
      ingresos: {
        total: conciliacion.ingresos,
        cantidad: conciliacion.activeMovements.filter(m => m.type === MovementType.INGRESO).length
      },
      egresos: {
        total: conciliacion.egresos,
        cantidad: conciliacion.activeMovements.filter(m => m.type === MovementType.GASTO).length
      }
    },
    balances: {
      calculado: conciliacion.balanceCalculado,
      fisico: conciliacion.conteoFisico,
      diferencia: conciliacion.diferencia,
      variacionPorcentaje: (conciliacion.diferencia / Math.max(conciliacion.balanceCalculado, 1)) * 100
    },
    validacion: {
      balanceado: validacion.isBalanced,
      mensaje: validacion.mensaje,
      requiereAjuste: validacion.requiresAdjustment
    }
  };
};
