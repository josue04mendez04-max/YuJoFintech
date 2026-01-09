import { Movement, MovementType, MovementStatus, Inversion, InversionStatus, CorteSummary } from './types';

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
 * Calcula la fórmula de conciliación:
 * Saldo_Final = Saldo_Inicial + Ingresos - Egresos - Inversiones + Desinversiones
 */
export const calcularConciliacion = (input: ConciliationInput) => {
  const { movements, inversiones, physicalTotal, saldoInicial = 0 } = input;

  // Filtrar movimientos pendientes de corte
  const activeMovements = movements.filter(m => m.status === MovementStatus.PENDIENTE_CORTE);

  // Calcular flujos de efectivo
  const ingresos = activeMovements
    .filter(m => m.type === MovementType.INGRESO)
    .reduce((a, b) => a + b.amount, 0);

  const egresos = activeMovements
    .filter(m => m.type === MovementType.GASTO)
    .reduce((a, b) => a + b.amount, 0);

  // Inversiones realizadas (nuevas inversiones)
  const inversionesRealizadas = activeMovements
    .filter(m => m.type === MovementType.INVERSION)
    .reduce((a, b) => a + b.amount, 0);

  // Desinversiones (retornos de inversiones)
  const desinversionesRetornadas = activeMovements
    .filter(m => 
      m.type === MovementType.INGRESO && 
      m.description?.toUpperCase().includes('RETORNO')
    )
    .reduce((a, b) => a + b.amount, 0);

  // Fórmula: Saldo_Final = Saldo_Inicial + Ingresos - Egresos - Inversiones + Desinversiones
  const balanceCalculado = saldoInicial + ingresos - egresos - inversionesRealizadas + desinversionesRetornadas;

  // Diferencia entre conteo físico y cálculo
  const diferencia = physicalTotal - balanceCalculado;

  // Inversiones activas (total de inversiones que no están completadas)
  const inversionesActivas = inversiones
    .filter(i => i.status !== InversionStatus.COMPLETADA)
    .reduce((a, b) => a + b.monto, 0);

  // Capital total (patrimonio)
  const efectivoDisponible = balanceCalculado;
  const capitalTotal = efectivoDisponible + inversionesActivas;

  return {
    saldoInicial,
    ingresos,
    egresos,
    inversionesRealizadas,
    desinversionesRetornadas,
    balanceCalculado,
    conteoFisico: physicalTotal,
    diferencia,
    patrimonio: {
      efectivoDisponible,
      inversionesActivas,
      capitalTotal
    },
    activeMovements,
    inversionesActivas: inversionesActivas
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
  validacion: ReturnType<typeof validarCorte>,
  saldoInicial?: number
): CorteSummary => {
  return {
    id: `CORTE-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleDateString('es-MX'),
    saldoInicial: saldoInicial || 0,
    ingresosTotal: conciliacion.ingresos,
    egresosTotal: conciliacion.egresos,
    inversionesRealizadas: conciliacion.inversionesRealizadas,
    desinversionesRetornadas: conciliacion.desinversionesRetornadas,
    balanceCalculado: conciliacion.balanceCalculado,
    conteoFisico: conciliacion.conteoFisico,
    diferencia: conciliacion.diferencia,
    patrimonio: conciliacion.patrimonio,
    movements: conciliacion.activeMovements,
    // Compatibilidad con estructura anterior
    gastosTotal: conciliacion.egresos,
    balanceSistema: conciliacion.balanceCalculado,
    ajuste: validacion.requiresAdjustment ? {
      tipo: conciliacion.diferencia > 0 ? 'SOBRANTE' : 'FALTANTE',
      monto: Math.abs(conciliacion.diferencia),
      descripcion: validacion.mensaje
    } : undefined
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
      },
      inversiones: {
        realizadas: conciliacion.inversionesRealizadas,
        desinvertidas: conciliacion.desinversionesRetornadas,
        netas: conciliacion.inversionesRealizadas - conciliacion.desinversionesRetornadas,
        cantidad: conciliacion.activeMovements.filter(m => m.type === MovementType.INVERSION).length
      }
    },
    balances: {
      calculado: conciliacion.balanceCalculado,
      fisico: conciliacion.conteoFisico,
      diferencia: conciliacion.diferencia,
      variacionPorcentaje: (conciliacion.diferencia / Math.max(conciliacion.balanceCalculado, 1)) * 100
    },
    patrimonio: conciliacion.patrimonio,
    validacion: {
      balanceado: validacion.isBalanced,
      mensaje: validacion.mensaje,
      requiereAjuste: validacion.requiresAdjustment
    }
  };
};
