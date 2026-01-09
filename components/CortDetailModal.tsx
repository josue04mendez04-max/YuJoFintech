import React from 'react';
import { Movement, MovementType } from '../types';

interface CortDetailModalProps {
  cutId: string;
  movements: Movement[];
  isOpen: boolean;
  onClose: () => void;
  onPrint?: () => void;
}

const CortDetailModal: React.FC<CortDetailModalProps> = ({ 
  cutId, 
  movements, 
  isOpen, 
  onClose,
  onPrint
}) => {
  if (!isOpen) return null;

  const totalIngresos = movements
    .filter(m => m.type === MovementType.INGRESO)
    .reduce((a, b) => a + b.amount, 0);
  
  const totalEgresos = movements
    .filter(m => m.type === MovementType.GASTO)
    .reduce((a, b) => a + b.amount, 0);

  const balance = totalIngresos - totalEgresos;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-lg sm:rounded-2xl md:rounded-[2rem] w-full max-w-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 bg-forest-green/50 backdrop-blur-sm border-b border-white/10 p-4 sm:p-6 flex justify-between items-center">
          <div>
            <h2 className="text-white text-2xl sm:text-3xl font-serif font-bold italic">{cutId}</h2>
            <p className="text-white/40 text-xs sm:text-sm">Detalles del corte de caja</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-4 sm:p-8 space-y-6">
          {/* Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 sm:p-6 bg-green-500/10 rounded-lg sm:rounded-2xl border border-green-500/20">
              <p className="text-green-400 text-[10px] sm:text-xs uppercase font-bold tracking-wider mb-2">Total Ingresos</p>
              <p className="text-green-300 text-2xl sm:text-3xl font-serif font-bold italic">${totalIngresos.toLocaleString()}</p>
            </div>

            <div className="text-center p-4 sm:p-6 bg-red-500/10 rounded-lg sm:rounded-2xl border border-red-500/20">
              <p className="text-red-400 text-[10px] sm:text-xs uppercase font-bold tracking-wider mb-2">Total Egresos</p>
              <p className="text-red-300 text-2xl sm:text-3xl font-serif font-bold italic">${totalEgresos.toLocaleString()}</p>
            </div>

            <div className="text-center p-4 sm:p-6 bg-mustard/10 rounded-lg sm:rounded-2xl border border-mustard/20">
              <p className="text-mustard/60 text-[10px] sm:text-xs uppercase font-bold tracking-wider mb-2">Balance</p>
              <p className="text-white text-2xl sm:text-3xl font-serif font-bold italic">${balance.toLocaleString()}</p>
            </div>
          </div>

          {/* Detalles de movimientos */}
          <div>
            <h3 className="text-white/40 text-xs sm:text-sm uppercase font-bold tracking-widest mb-4">Detalle de Movimientos ({movements.length})</h3>
            
            <div className="space-y-2 sm:space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {movements.length === 0 ? (
                <p className="text-white/30 italic font-serif text-sm text-center py-8">No hay movimientos en este corte.</p>
              ) : (
                movements.map((m) => (
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
                    <p className={`font-serif italic font-bold text-xs sm:text-sm flex-shrink-0 ${m.type === MovementType.INGRESO ? 'text-green-400' : 'text-red-400'}`}>
                      {m.type === MovementType.GASTO ? '-' : '+'}${m.amount.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
            {onPrint && (
              <button
                onClick={onPrint}
                className="flex-1 py-3 sm:py-4 rounded-lg sm:rounded-xl bg-mustard text-forest-green font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">print</span>
                <span className="hidden sm:inline">Imprimir Corte</span>
                <span className="sm:hidden">Imprimir</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 sm:py-4 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CortDetailModal;
