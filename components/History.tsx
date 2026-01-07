
import React from 'react';
import { Movement, MovementType, MovementStatus } from '../types';

interface HistoryProps {
  movements: Movement[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPrint: (movement: Movement) => void;
}

const History: React.FC<HistoryProps> = ({ movements, onEdit, onDelete, onPrint }) => {
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

  return (
    <div className="glass rounded-[2rem] p-8 overflow-hidden shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-serif italic text-white">Historial de Transacciones</h3>
        <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Registro Notarial de YuJo</p>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-4 px-4 text-mustard text-xs uppercase tracking-widest font-bold">Folio</th>
              <th className="py-4 px-4 text-mustard text-xs uppercase tracking-widest font-bold">Fecha</th>
              <th className="py-4 px-4 text-mustard text-xs uppercase tracking-widest font-bold">Descripción</th>
              <th className="py-4 px-4 text-mustard text-xs uppercase tracking-widest font-bold">Tipo</th>
              <th className="py-4 px-4 text-mustard text-xs uppercase tracking-widest font-bold">Estado</th>
              <th className="py-4 px-4 text-mustard text-xs uppercase tracking-widest font-bold text-right">Monto</th>
              <th className="py-4 px-4 text-mustard text-xs uppercase tracking-widest font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-white divide-y divide-white/5">
            {movements.length === 0 ? (
               <tr>
                  <td colSpan={7} className="py-20 text-center text-white/30 italic font-serif">Aún no hay registros en la notaría.</td>
               </tr>
            ) : movements.map((m) => (
              <tr key={m.id} className="group hover:bg-white/5 transition-all">
                <td className="py-4 px-4 text-white/30 font-mono text-[10px] uppercase">{m.id}</td>
                <td className="py-4 px-4 whitespace-nowrap text-sm">{m.date}</td>
                <td className="py-4 px-4 max-w-xs truncate text-sm">{m.description}</td>
                <td className={`py-4 px-4 text-xs font-bold ${getTypeLabel(m.type)}`}>
                  {m.type}
                </td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-bold border uppercase tracking-tighter ${getStatusBadge(m.status)}`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-serif italic text-lg">
                  ${m.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => onPrint(m)}
                      title="Imprimir Recibo"
                      className="p-2 text-white/40 hover:text-mustard transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">print</span>
                    </button>
                    <button 
                      onClick={() => onEdit(m.id)}
                      title="Editar (Requiere PIN)"
                      className="p-2 text-white/40 hover:text-mustard transition-colors md:opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button 
                      onClick={() => onDelete(m.id)}
                      title="Eliminar (Requiere PIN)"
                      className="p-2 text-white/40 hover:text-red-400 transition-colors md:opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;
