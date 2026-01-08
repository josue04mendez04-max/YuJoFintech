
import React from 'react';
import { Movement, MovementType, MovementStatus } from '../types';

interface CorteDeCajaProps {
  movements: Movement[];
  physicalTotal: number;
  onConfirmCorte: () => void;
}

const CorteDeCaja: React.FC<CorteDeCajaProps> = ({ movements, physicalTotal, onConfirmCorte }) => {
  const activeMovements = movements.filter(m => m.status === MovementStatus.PENDIENTE_CORTE);
  
  const totalIngresos = activeMovements
    .filter(m => m.type === MovementType.INGRESO)
    .reduce((a, b) => a + b.amount, 0);
  
  const totalEgresos = activeMovements
    .filter(m => m.type === MovementType.GASTO)
    .reduce((a, b) => a + b.amount, 0);

  const balanceSistema = totalIngresos - totalEgresos;
  const diferencia = physicalTotal - balanceSistema;

  return (
    <div className="flex flex-col gap-4 sm:gap-8 max-w-full sm:max-w-4xl mx-auto px-2 sm:px-0">
      <div className="glass rounded-lg sm:rounded-2xl md:rounded-[2rem] p-4 sm:p-10 border border-white/5 shadow-2xl">
        <h2 className="text-white text-2xl sm:text-3xl font-serif font-bold italic mb-6 sm:mb-10 text-center">Resumen del Ciclo</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
          <div className="text-center p-4 sm:p-6 bg-white/5 rounded-lg sm:rounded-3xl border border-white/5">
            <p className="text-white/40 text-[8px] sm:text-[10px] uppercase font-bold mb-2 sm:mb-3">Ingresos</p>
            <p className="text-green-400 text-xl sm:text-3xl font-serif font-bold italic">${totalIngresos.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white/5 rounded-lg sm:rounded-3xl border border-white/5">
            <p className="text-white/40 text-[8px] sm:text-[10px] uppercase font-bold mb-2 sm:mb-3">Egresos</p>
            <p className="text-red-400 text-xl sm:text-3xl font-serif font-bold italic">${totalEgresos.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-mustard/10 rounded-lg sm:rounded-3xl border border-mustard/20">
            <p className="text-mustard/60 text-[8px] sm:text-[10px] uppercase font-bold mb-2 sm:mb-3">Balance</p>
            <p className="text-white text-xl sm:text-3xl font-serif font-bold italic">${balanceSistema.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8 p-4 sm:p-8 bg-black/20 rounded-lg sm:rounded-[2.5rem] border border-white/10">
           <div className="text-center md:text-left w-full md:w-auto">
              <p className="text-white/40 text-[8px] sm:text-xs uppercase font-bold tracking-widest mb-1 sm:mb-2">Total Físico</p>
              <p className="text-white text-3xl sm:text-5xl font-serif font-bold italic">${physicalTotal.toLocaleString()}</p>
           </div>
           
           <div className="hidden md:block h-16 sm:h-20 w-px bg-white/10"></div>

           <div className="text-center md:text-right w-full md:w-auto">
              <p className="text-white/40 text-[8px] sm:text-xs uppercase font-bold tracking-widest mb-1 sm:mb-2">Diferencia</p>
              <p className={`text-2xl sm:text-4xl font-serif font-bold italic ${Math.abs(diferencia) < 0.01 ? 'text-green-400' : 'text-red-400'}`}>
                ${diferencia.toLocaleString()}
              </p>
              <p className="text-[8px] sm:text-[10px] text-white/20 mt-1">{Math.abs(diferencia) < 0.01 ? 'Cuadre OK' : 'Descuadre'}</p>
           </div>
        </div>

        <div className="mt-8 sm:mt-12 flex flex-col gap-4">
          <p className="text-white/40 text-xs sm:text-sm text-center italic mb-2">
            Se archivarán {activeMovements.length} registros.
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
            <span className="material-symbols-outlined text-lg sm:text-2xl">print_connect</span>
            <span className="hidden sm:inline">Confirmar y Generar Recibo</span>
            <span className="sm:hidden">Confirmar</span>
          </button>
        </div>
      </div>

      {/* Lista de movimientos que se archivarán */}
      <div className="glass rounded-lg sm:rounded-2xl md:rounded-[2rem] p-4 sm:p-8 border border-white/5">
        <h3 className="text-white/40 text-xs sm:text-sm uppercase font-bold tracking-widest mb-4 sm:mb-6">Detalle de Corte</h3>
        <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto custom-scrollbar">
           {activeMovements.map(m => (
             <div key={m.id} className="flex justify-between items-center py-2 sm:py-3 border-b border-white/5 px-2">
                <div className="min-w-0 flex-1">
                   <p className="text-white font-serif italic text-xs sm:text-sm truncate">{m.description}</p>
                   <p className="text-[8px] sm:text-[10px] text-white/30 uppercase truncate">{m.id} • {m.responsible}</p>
                </div>
                <p className={`font-serif italic font-bold text-sm sm:text-base ml-4 flex-shrink-0 ${m.type === MovementType.INGRESO ? 'text-green-400' : 'text-red-400'}`}>
                  {m.type === MovementType.GASTO ? '-' : ''}${m.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default CorteDeCaja;
