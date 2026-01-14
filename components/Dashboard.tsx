
import React, { useMemo } from 'react';
import { Movement, MovementType, MovementStatus, VaultCount } from '../types';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  movements: Movement[];
  vault: VaultCount;
  onOpenVault: () => void;
  onPerformCut: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ movements, vault, onOpenVault, onPerformCut }) => {
  const stats = useMemo(() => {
    // Filtrar solo movimientos pendientes de corte (ciclo actual)
    const activeCycle = movements.filter(m => m.status === MovementStatus.PENDIENTE_CORTE);
    
    // Calcular ingresos totales
    const ingresos = activeCycle
      .filter(m => m.type === MovementType.INGRESO)
      .reduce((a, b) => a + b.amount, 0);
      
    // Calcular gastos totales
    const gastos = activeCycle
      .filter(m => m.type === MovementType.GASTO)
      .reduce((a, b) => a + b.amount, 0);
    
    // Balance actual: Ingresos - Gastos
    const balanceTotal = ingresos - gastos;

    return { 
      ingresos,
      gastos,
      balanceTotal
    };
  }, [movements]);

  const physicalTotal = useMemo(() => {
    if (!vault) return 0;
    let total = 0;
    Object.entries(vault.bills || {}).forEach(([denom, count]) => total += Number(denom) * (count || 0));
    Object.entries(vault.coins || {}).forEach(([denom, count]) => total += Number(denom) * (count || 0));
    return total;
  }, [vault]);

  const chartData = [
    { name: 'P1', val: stats.balanceTotal * 0.4 },
    { name: 'P2', val: stats.balanceTotal * 0.7 },
    { name: 'P3', val: stats.balanceTotal * 0.5 },
    { name: 'P4', val: stats.balanceTotal * 0.9 },
    { name: 'P5', val: stats.balanceTotal * 0.8 },
    { name: 'P6', val: stats.balanceTotal * 1.0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-10">
      {/* Tarjeta 1: Ingresos Totales */}
      <div className="glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-4 sm:p-8 md:p-12 text-white shadow-glass-panel relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-[4rem] sm:text-[8rem] md:text-[12rem]">trending_up</span>
        </div>
        <div className="relative z-10">
          <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-[8px] sm:text-[9px] md:text-[10px] mb-2 sm:mb-4">Ingresos Totales</p>
          <h3 className="text-3xl sm:text-5xl md:text-8xl font-serif font-bold italic tracking-tighter text-green-400 glow">
            ${stats.ingresos.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-white/50 text-xs sm:text-sm mt-4">Dinero que ha entrado en el ciclo</p>
        </div>
      </div>

      {/* Tarjeta 2: Egresos Totales */}
      <div className="glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-4 sm:p-8 md:p-12 text-white shadow-glass-panel relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-[4rem] sm:text-[8rem] md:text-[12rem]">trending_down</span>
        </div>
        <div className="relative z-10">
          <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-[8px] sm:text-[9px] md:text-[10px] mb-2 sm:mb-4">Egresos Totales</p>
          <h3 className="text-3xl sm:text-5xl md:text-8xl font-serif font-bold italic tracking-tighter text-red-400 glow">
            ${stats.gastos.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-white/50 text-xs sm:text-sm mt-4">Dinero que ha salido de la caja</p>
        </div>
      </div>

      {/* Tarjeta 3: Balance Actual (Grande, Central) */}
      <div className="lg:col-span-3 glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-6 sm:p-12 md:p-16 text-white shadow-glass-panel relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[8rem] sm:text-[12rem] md:text-[16rem]">account_balance_wallet</span>
        </div>
        <div className="relative z-10 text-center">
          <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-[8px] sm:text-[9px] md:text-[10px] mb-4 sm:mb-6">Balance Actual</p>
          <h2 className={`text-5xl sm:text-7xl md:text-9xl font-serif font-bold italic tracking-tighter mustard-glow ${
            stats.balanceTotal >= 0 ? 'text-green-300' : 'text-red-300'
          }`}>
            ${stats.balanceTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
          <p className="text-white/50 text-sm sm:text-base mt-6">Dinero disponible en caja = Ingresos - Egresos</p>
          
          {/* Gráfico de tendencia */}
          <div className="mt-8 h-20 sm:h-32 md:h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="#22c55e" strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Barra de Cuadre */}
      <div className="lg:col-span-3 glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-4 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8 md:gap-12 border-t border-white/20 shadow-glass-panel">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-16 w-full md:w-auto">
           <div>
              <p className="text-white/40 text-[8px] sm:text-[10px] uppercase font-bold tracking-[0.4em] mb-1 sm:mb-2">Caja Física</p>
              <p className="text-white text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold tracking-tight">${physicalTotal.toLocaleString()}</p>
           </div>
           <div className="h-12 sm:h-16 w-px bg-white/10 hidden sm:block"></div>
           <div>
              <p className="text-white/40 text-[8px] sm:text-[10px] uppercase font-bold tracking-[0.4em] mb-1 sm:mb-2">Conteo Bóveda</p>
              <p className="text-mustard text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold tracking-tight">${physicalTotal.toLocaleString()}</p>
           </div>
        </div>
        
        <div className="flex flex-col gap-3 sm:gap-6 w-full md:w-auto">
          <button 
            onClick={onOpenVault}
            className="flex-1 md:flex-none liquid-btn text-forest-green text-[10px] sm:text-xs font-bold px-4 sm:px-12 py-3 sm:py-5 rounded-lg sm:rounded-2xl uppercase tracking-[0.2em]"
          >
            Sellar Bóveda
          </button>
          
          {Math.abs(stats.balanceTotal - physicalTotal) < 0.01 ? (
             <div className="bg-mustard/20 text-mustard px-4 sm:px-10 py-3 sm:py-5 rounded-lg sm:rounded-2xl flex items-center gap-2 sm:gap-3 font-bold border border-mustard/30 uppercase text-[8px] sm:text-[10px] tracking-[0.3em] shadow-lg shadow-mustard/10">
                <span className="material-symbols-outlined text-sm sm:text-lg">verified</span>
                <span className="hidden sm:inline">Cuadre Perfecto</span>
                <span className="sm:hidden">OK</span>
             </div>
          ) : (
             <div className="bg-red-500/20 text-red-400 px-4 sm:px-10 py-3 sm:py-5 rounded-lg sm:rounded-2xl flex items-center gap-2 sm:gap-3 font-bold border border-red-500/30 uppercase text-[8px] sm:text-[10px] tracking-[0.3em] shadow-lg shadow-red-500/10">
                <span className="material-symbols-outlined text-sm sm:text-lg">warning</span>
                <span className="hidden sm:inline">Descuadre</span>
                <span className="sm:hidden">Error</span>
             </div>
          )}
        </div>

        <button 
          onClick={onPerformCut}
          className="liquid-btn text-forest-green font-bold text-sm sm:text-lg md:text-2xl py-4 sm:py-5 md:py-7 rounded-lg sm:rounded-2xl md:rounded-[32px] flex items-center justify-center gap-2 sm:gap-4 uppercase tracking-[0.2em] hover:scale-[1.02] w-full md:w-auto"
        >
          <span className="material-symbols-outlined text-xl sm:text-2xl md:text-3xl">account_balance_wallet</span>
          <span className="hidden sm:inline">Ejecutar Corte</span>
          <span className="sm:hidden">Corte</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
