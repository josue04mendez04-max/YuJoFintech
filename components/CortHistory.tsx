import React, { useMemo } from 'react';
import { Movement, MovementType, MovementStatus } from '../types';

interface CortHistoryProps {
  movements: Movement[];
  onViewDetails: (cutId: string) => void;
}

interface CortGroup {
  cutId: string;
  date: string;
  count: number;
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  movements: Movement[];
}

const CortHistory: React.FC<CortHistoryProps> = ({ movements, onViewDetails }) => {
  // Agrupar movimientos archivados por cutId
  const cortes = useMemo(() => {
    const archivedMovements = movements.filter(m => m.status === MovementStatus.ARCHIVADO);
    const grouped = new Map<string, Movement[]>();

    // Agrupar por cutId
    archivedMovements.forEach(m => {
      const cutId = m.cutId || 'SIN_CORTE';
      if (!grouped.has(cutId)) {
        grouped.set(cutId, []);
      }
      grouped.get(cutId)!.push(m);
    });

    // Convertir a array de CortGroup
    const corteSummaries: CortGroup[] = [];
    grouped.forEach((movs, cutId) => {
      const ingresos = movs
        .filter(m => m.type === MovementType.INGRESO)
        .reduce((a, b) => a + b.amount, 0);
      
      const egresos = movs
        .filter(m => m.type === MovementType.GASTO)
        .reduce((a, b) => a + b.amount, 0);

      // Extraer fecha del primer movimiento (están ordenados por fecha)
      const date = movs.length > 0 ? movs[0].date : new Date().toISOString().split('T')[0];

      corteSummaries.push({
        cutId,
        date,
        count: movs.length,
        totalIngresos: ingresos,
        totalEgresos: egresos,
        balance: ingresos - egresos,
        movements: movs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      });
    });

    // Ordenar por fecha descendente
    return corteSummaries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [movements]);

  if (cortes.length === 0) {
    return (
      <div className="glass rounded-lg sm:rounded-2xl md:rounded-[2rem] p-4 sm:p-8 border border-white/5 shadow-2xl">
        <h2 className="text-white text-2xl sm:text-3xl font-serif font-bold italic mb-6">Historial de Cortes</h2>
        <div className="text-center py-12 sm:py-20">
          <p className="text-white/30 italic font-serif text-base sm:text-lg">No hay cortes archivados aún.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg sm:rounded-2xl md:rounded-[2rem] p-4 sm:p-8 border border-white/5 shadow-2xl">
      <h2 className="text-white text-2xl sm:text-3xl font-serif font-bold italic mb-6 sm:mb-8">Historial de Cortes</h2>
      
      <div className="space-y-3 sm:space-y-4">
        {cortes.map((corte) => (
          <div 
            key={corte.cutId}
            className="group cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 hover:border-mustard/30 rounded-lg sm:rounded-2xl p-4 sm:p-6 transition-all"
            onClick={() => onViewDetails(corte.cutId)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
              {/* Identificador y Fecha */}
              <div className="flex-1 min-w-0">
                <p className="text-mustard font-serif italic font-bold text-base sm:text-lg">{corte.cutId}</p>
                <p className="text-white/40 text-xs sm:text-sm">{corte.date}</p>
              </div>

              {/* Cantidad de registros */}
              <div className="text-center px-3 sm:px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-[10px] sm:text-xs uppercase font-bold tracking-wider">Registros</p>
                <p className="text-blue-300 text-lg sm:text-xl font-serif font-bold">{corte.count}</p>
              </div>

              {/* Ingresos */}
              <div className="text-center px-3 sm:px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-[10px] sm:text-xs uppercase font-bold tracking-wider">Ingresos</p>
                <p className="text-green-300 text-base sm:text-lg font-serif font-bold">${corte.totalIngresos.toLocaleString()}</p>
              </div>

              {/* Egresos */}
              <div className="text-center px-3 sm:px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-[10px] sm:text-xs uppercase font-bold tracking-wider">Egresos</p>
                <p className="text-red-300 text-base sm:text-lg font-serif font-bold">${corte.totalEgresos.toLocaleString()}</p>
              </div>

              {/* Balance */}
              <div className="text-center px-3 sm:px-4 py-2 bg-mustard/10 border border-mustard/20 rounded-lg">
                <p className="text-mustard/60 text-[10px] sm:text-xs uppercase font-bold tracking-wider">Balance</p>
                <p className="text-white text-base sm:text-lg font-serif font-bold">${corte.balance.toLocaleString()}</p>
              </div>

              {/* Icono de ver detalles */}
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-white/5 group-hover:bg-mustard/20 group-hover:text-mustard text-white/40 transition-all">
                <span className="material-symbols-outlined text-lg sm:text-2xl">arrow_outward</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CortHistory;
