
import React, { useMemo } from 'react';
import { Movement, MovementType, MovementStatus } from '../types';
import * as ConciliacionService from '../conciliacion.service';

interface CorteDeCajaProps {
  movements: Movement[];
  physicalTotal: number;
  onConfirmCorte: () => void;
}

const CorteDeCaja: React.FC<CorteDeCajaProps> = ({ movements, physicalTotal, onConfirmCorte }) => {
  const activeMovements = movements.filter(m => m.status === MovementStatus.PENDIENTE_CORTE);
  
  // Usar el servicio de conciliación para cálculos más robustos
  const conciliacion = useMemo(() => {
    return ConciliacionService.calcularConciliacion({
      movements,
      inversiones: [],
      physicalTotal,
      saldoInicial: 0
    });
  }, [movements, physicalTotal]);

  const validacion = useMemo(() => {
    return ConciliacionService.validarCorte(conciliacion);
  }, [conciliacion]);

  const totalIngresos = conciliacion.ingresos;
  const totalEgresos = conciliacion.egresos;
  const balanceCalculado = conciliacion.balanceCalculado;
  const diferencia = conciliacion.diferencia;

  return (
    <div className="flex flex-col gap-4 sm:gap-8 max-w-full sm:max-w-6xl mx-auto px-2 sm:px-0">
      {/* Resumen Principal */}
      <div className="glass rounded-lg sm:rounded-2xl md:rounded-[2rem] p-4 sm:p-10 border border-white/5 shadow-2xl">
        <h2 className="text-white text-2xl sm:text-3xl font-serif font-bold italic mb-6 sm:mb-10 text-center">Conciliación de Saldos</h2>
        
        {/* Primera fila: Flujos de Efectivo */}
        <div className="mb-8 sm:mb-10">
          <p className="text-white/40 text-[8px] sm:text-[10px] uppercase font-bold tracking-widest mb-4">Flujo de Efectivo</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-green-500/10 rounded-lg sm:rounded-2xl border border-green-500/20">
              <p className="text-green-400 text-[9px] sm:text-[10px] uppercase font-bold mb-1 sm:mb-2">Ingresos</p>
              <p className="text-green-300 text-lg sm:text-2xl font-serif font-bold italic">${totalIngresos.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-red-500/10 rounded-lg sm:rounded-2xl border border-red-500/20">
              <p className="text-red-400 text-[9px] sm:text-[10px] uppercase font-bold mb-1 sm:mb-2">Egresos</p>
              <p className="text-red-300 text-lg sm:text-2xl font-serif font-bold italic">${totalEgresos.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-mustard/10 rounded-lg sm:rounded-2xl border border-mustard/20">
              <p className="text-mustard/60 text-[9px] sm:text-[10px] uppercase font-bold mb-1 sm:mb-2">Balance Calc.</p>
              <p className="text-white text-lg sm:text-2xl font-serif font-bold italic">${balanceCalculado.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Segunda fila: Conciliación */}
        <div className="mb-8 sm:mb-10">
          <p className="text-white/40 text-[8px] sm:text-[10px] uppercase font-bold tracking-widest mb-4">Conciliación</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-4 sm:p-6 bg-blue-500/10 rounded-lg sm:rounded-2xl border border-blue-500/20">
              <p className="text-blue-400 text-[9px] sm:text-[10px] uppercase font-bold mb-2 sm:mb-3">Balance Sistema</p>
              <p className="text-blue-300 text-2xl sm:text-3xl font-serif font-bold italic">${balanceCalculado.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 sm:p-6 bg-cyan-500/10 rounded-lg sm:rounded-2xl border border-cyan-500/20">
              <p className="text-cyan-400 text-[9px] sm:text-[10px] uppercase font-bold mb-2 sm:mb-3">Conteo Físico</p>
              <p className="text-cyan-300 text-2xl sm:text-3xl font-serif font-bold italic">${physicalTotal.toLocaleString()}</p>
            </div>
            <div className={`text-center p-4 sm:p-6 rounded-lg sm:rounded-2xl border ${
              Math.abs(diferencia) < 0.01 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <p className={`text-[9px] sm:text-[10px] uppercase font-bold mb-2 sm:mb-3 ${
                Math.abs(diferencia) < 0.01 ? 'text-green-400' : 'text-red-400'
              }`}>
                {Math.abs(diferencia) < 0.01 ? '✓ Cuadre' : '⚠ Diferencia'}
              </p>
              <p className={`text-2xl sm:text-3xl font-serif font-bold italic ${
                Math.abs(diferencia) < 0.01 ? 'text-green-300' : 'text-red-300'
              }`}>
                ${Math.abs(diferencia).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Patrimonio - Enhanced with Smart Breakdown */}
        <div className="mb-8 sm:mb-10 p-4 sm:p-6 bg-white/5 rounded-lg sm:rounded-2xl border border-white/10">
          <p className="text-white/40 text-[8px] sm:text-[10px] uppercase font-bold tracking-widest mb-4">Posición de Activos</p>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div className="p-3 sm:p-4 bg-mustard/20 rounded-lg border border-mustard/30">
              <p className="text-mustard/70 text-[9px] sm:text-[10px] uppercase font-bold mb-2">Efectivo Disponible</p>
              <p className="text-white text-xl sm:text-2xl font-serif font-bold">${balanceCalculado.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-center text-white/30 text-[7px] sm:text-[8px] italic pt-3 border-t border-white/5">
            ✓ Esto evita el estrés de pensar que falta dinero cuando haces el corte diario
          </div>
        </div>

        {/* Estado de Validación */}
        <div className={`mb-8 sm:mb-10 p-4 sm:p-6 rounded-lg sm:rounded-2xl border ${
          validacion.isBalanced 
            ? 'bg-green-500/10 border-green-500/20' 
            : 'bg-yellow-500/10 border-yellow-500/20'
        }`}>
          <p className={`text-sm sm:text-base font-bold ${validacion.isBalanced ? 'text-green-300' : 'text-yellow-300'}`}>
            {validacion.mensaje}
          </p>
        </div>

        {/* Botón de Confirmación */}
        <div className="flex flex-col gap-4">
          <p className="text-white/40 text-xs sm:text-sm text-center italic">
            Se archivarán {activeMovements.length} registros en este ciclo.
          </p>
          <button 
            disabled={activeMovements.length === 0}
            onClick={onConfirmCorte}
            className={`liquid-btn w-full py-4 sm:py-6 rounded-lg sm:rounded-3xl text-base sm:text-xl font-bold flex items-center justify-center gap-2 sm:gap-3 shadow-xl transition-all ${
              activeMovements.length === 0 
              ? 'bg-white/5 text-white/20 cursor-not-allowed' 
              : 'bg-mustard text-forest-green hover:scale-[1.02]'
            }`}
          >
            <span className="material-symbols-outlined text-lg sm:text-2xl">check_circle</span>
            <span className="hidden sm:inline">Confirmar Corte</span>
            <span className="sm:hidden">Confirmar</span>
          </button>
        </div>
      </div>

      {/* Desglose de Movimientos */}
      <div className="glass rounded-lg sm:rounded-2xl md:rounded-[2rem] p-4 sm:p-8 border border-white/5">
        <h3 className="text-white/40 text-xs sm:text-sm uppercase font-bold tracking-widest mb-4 sm:mb-6">Detalle de Operaciones ({activeMovements.length})</h3>
        <div className="max-h-[400px] sm:max-h-[500px] overflow-y-auto custom-scrollbar">
          {activeMovements.length === 0 ? (
            <p className="text-white/30 italic font-serif text-sm text-center py-8">No hay movimientos pendientes de corte.</p>
          ) : (
            <div className="space-y-2">
              {activeMovements.map(m => (
                <div key={m.id} className="flex justify-between items-start gap-3 p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-serif italic text-xs sm:text-sm truncate">{m.description}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-[8px] sm:text-[10px] text-white/30 font-mono uppercase">{m.id}</span>
                      <span className="text-[8px] sm:text-[10px] text-white/30">•</span>
                      <span className="text-[8px] sm:text-[10px] text-white/30">{m.date}</span>
                      <span className="text-[8px] sm:text-[10px] text-white/30">•</span>
                      <span className="text-[8px] sm:text-[10px] text-white/30">{m.responsible}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <p className={`font-serif italic font-bold text-xs sm:text-sm ${
                      m.type === MovementType.INGRESO ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {m.type === MovementType.GASTO ? '-' : '+'}${m.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </p>
                    <span className="text-[8px] text-white/20 uppercase">{m.type}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorteDeCaja;
