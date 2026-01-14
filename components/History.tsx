
import React from 'react';
import { Movement, MovementType, MovementStatus, Inversion } from '../types';

interface HistoryProps {
  movements: Movement[];
  inversiones: Inversion[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPrint: (movement: Movement) => void;
}

const History: React.FC<HistoryProps> = ({ movements, inversiones, onEdit, onDelete, onPrint }) => {
  const getStatusBadge = (status: MovementStatus) => {
    switch (status) {
      case MovementStatus.PENDIENTE_CORTE: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case MovementStatus.EN_CURSO: return 'bg-mustard/20 text-mustard border-mustard/30';
      case MovementStatus.ARCHIVADO: return 'bg-white/10 text-white/40 border-white/5';
      default: return 'bg-white/10 text-white';
    }
  };

  const getTypeLabel = (type: MovementType) => {
    if (type === MovementType.INGRESO) return 'text-green-400';
    if (type === MovementType.GASTO) return 'text-red-400';
    return 'text-mustard';
  };

  // Función para determinar si una inversión está vencida
  const isInversionOverdue = (movement: Movement): boolean => {
    if (movement.type !== MovementType.INVERSION || movement.status !== MovementStatus.EN_CURSO) {
      return false;
    }
    
    // Buscar la inversión correspondiente por descripción o fecha
    const inversion = inversiones.find(inv => 
      inv.descripcion === movement.description && 
      inv.status !== 'COMPLETADA'
    );
    
    if (!inversion?.fechaPromesaRetorno) {
      return false;
    }
    
    const today = new Date();
    const promiseDate = new Date(inversion.fechaPromesaRetorno);
    return today > promiseDate;
  };

  return (
    <div className="glass rounded-lg sm:rounded-2xl md:rounded-[2rem] p-4 sm:p-8 overflow-hidden shadow-2xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-2xl font-serif italic text-white">Historial</h3>
        <p className="text-white/40 text-[8px] sm:text-xs uppercase tracking-widest font-bold">Registro YuJo</p>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 sm:py-4 px-3 sm:px-4 text-mustard text-[8px] sm:text-xs uppercase tracking-widest font-bold">Folio</th>
              <th className="py-3 sm:py-4 px-3 sm:px-4 text-mustard text-[8px] sm:text-xs uppercase tracking-widest font-bold">Fecha</th>
              <th className="py-3 sm:py-4 px-3 sm:px-4 text-mustard text-[8px] sm:text-xs uppercase tracking-widest font-bold">Descripción</th>
              <th className="py-3 sm:py-4 px-3 sm:px-4 text-mustard text-[8px] sm:text-xs uppercase tracking-widest font-bold">Tipo</th>
              <th className="py-3 sm:py-4 px-3 sm:px-4 text-mustard text-[8px] sm:text-xs uppercase tracking-widest font-bold">Estado</th>
              <th className="py-3 sm:py-4 px-3 sm:px-4 text-mustard text-[8px] sm:text-xs uppercase tracking-widest font-bold text-right">Monto</th>
              <th className="py-3 sm:py-4 px-3 sm:px-4 text-mustard text-[8px] sm:text-xs uppercase tracking-widest font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-white divide-y divide-white/5">
            {movements.length === 0 ? (
               <tr>
                  <td colSpan={7} className="py-12 sm:py-20 text-center text-white/30 italic font-serif text-sm sm:text-lg">Sin registros aún.</td>
               </tr>
            ) : movements.map((m) => {
              const isOverdue = isInversionOverdue(m);
              return (
              <tr key={m.id} className={`group hover:bg-white/5 transition-all ${isOverdue ? 'bg-red-500/10 border-l-4 border-red-500' : ''}`}>
                <td className="py-3 sm:py-4 px-3 sm:px-4 text-white/30 font-mono text-[8px] sm:text-[10px] uppercase">{m.id}</td>
                <td className="py-3 sm:py-4 px-3 sm:px-4 whitespace-nowrap text-xs sm:text-sm">{m.date}</td>
                <td className="py-3 sm:py-4 px-3 sm:px-4 max-w-[150px] sm:max-w-xs truncate text-xs sm:text-sm">
                  {isOverdue && <span className="material-symbols-outlined text-red-400 text-xs inline-block mr-1" title="Fecha de retorno vencida">warning</span>}
                  {m.description}
                </td>
                <td className={`py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-bold ${getTypeLabel(m.type)}`}>
                  {m.type}
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-4">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-[7px] sm:text-[9px] font-bold border uppercase tracking-tighter ${getStatusBadge(m.status)}`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </td>
                <td className={`py-3 sm:py-4 px-3 sm:px-4 text-right font-serif italic text-sm sm:text-lg ${isOverdue ? 'text-red-400 font-bold' : ''}`}>
                  ${m.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-4 text-center">
                  <div className="flex justify-center gap-1 sm:gap-2">
                    <button 
                      onClick={() => onPrint(m)}
                      title="Imprimir Recibo"
                      className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-white/5 text-white/40 hover:text-mustard hover:bg-mustard/10 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm sm:text-lg">print</span>
                    </button>
                    <button 
                      onClick={() => onEdit(m.id)}
                      title="Editar"
                      className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-white/5 text-white/40 hover:text-mustard transition-colors hidden sm:flex md:opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-sm sm:text-lg">edit</span>
                    </button>
                    <button 
                      onClick={() => onDelete(m.id)}
                      title="Eliminar"
                      className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-white/5 text-white/40 hover:text-red-400 transition-colors hidden sm:flex md:opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-sm sm:text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            )}
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
