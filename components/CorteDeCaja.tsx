
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
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="glass rounded-[2rem] p-10 border border-white/5 shadow-2xl">
        <h2 className="text-white text-3xl font-serif font-bold italic mb-10 text-center">Resumen del Ciclo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 bg-white/5 rounded-3xl border border-white/5">
            <p className="text-white/40 text-[10px] uppercase font-bold mb-2">Ingresos del Periodo</p>
            <p className="text-green-400 text-3xl font-serif font-bold italic">${totalIngresos.toLocaleString()}</p>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-3xl border border-white/5">
            <p className="text-white/40 text-[10px] uppercase font-bold mb-2">Egresos del Periodo</p>
            <p className="text-red-400 text-3xl font-serif font-bold italic">${totalEgresos.toLocaleString()}</p>
          </div>
          <div className="text-center p-6 bg-mustard/10 rounded-3xl border border-mustard/20">
            <p className="text-mustard/60 text-[10px] uppercase font-bold mb-2">Balance en Sistema</p>
            <p className="text-white text-3xl font-serif font-bold italic">${balanceSistema.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-black/20 rounded-[2.5rem] border border-white/10">
           <div className="text-center md:text-left">
              <p className="text-white/40 text-xs uppercase font-bold tracking-widest mb-1">Total Físico (Contabilidad)</p>
              <p className="text-white text-5xl font-serif font-bold italic">${physicalTotal.toLocaleString()}</p>
           </div>
           
           <div className="hidden md:block h-20 w-px bg-white/10"></div>

           <div className="text-center md:text-right">
              <p className="text-white/40 text-xs uppercase font-bold tracking-widest mb-1">Diferencia / Cuadre</p>
              <p className={`text-4xl font-serif font-bold italic ${Math.abs(diferencia) < 0.01 ? 'text-green-400' : 'text-red-400'}`}>
                ${diferencia.toLocaleString()}
              </p>
              <p className="text-[10px] text-white/20 mt-1">{Math.abs(diferencia) < 0.01 ? 'Caja perfectamente cuadrada' : 'Existe un descuadre en caja'}</p>
           </div>
        </div>

        <div className="mt-12 flex flex-col gap-4">
          <p className="text-white/40 text-xs text-center italic mb-4">
            Al confirmar, se archivarán {activeMovements.length} movimientos y se reiniciará el balance del Atrio.
          </p>
          <button 
            disabled={activeMovements.length === 0}
            onClick={onConfirmCorte}
            className={`liquid-btn w-full py-6 rounded-3xl text-xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all ${
              activeMovements.length === 0 
              ? 'bg-white/5 text-white/20 cursor-not-allowed' 
              : 'bg-mustard text-forest-green hover:scale-[1.02]'
            }`}
          >
            <span className="material-symbols-outlined">print_connect</span>
            Confirmar y Generar Recibo de Corte
          </button>
        </div>
      </div>

      {/* Lista de movimientos que se archivarán */}
      <div className="glass rounded-[2rem] p-8 border border-white/5">
        <h3 className="text-white/40 text-xs uppercase font-bold tracking-widest mb-6">Detalle de Corte (Folios Pendientes)</h3>
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
           {activeMovements.map(m => (
             <div key={m.id} className="flex justify-between items-center py-3 border-b border-white/5 px-2">
                <div>
                   <p className="text-white font-serif italic text-sm">{m.description}</p>
                   <p className="text-[10px] text-white/30 uppercase">{m.id} • {m.responsible}</p>
                </div>
                <p className={`font-serif italic font-bold ${m.type === MovementType.INGRESO ? 'text-green-400' : 'text-red-400'}`}>
                  {m.type === MovementType.GASTO ? '-' : ''}${m.amount.toLocaleString()}
                </p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default CorteDeCaja;
