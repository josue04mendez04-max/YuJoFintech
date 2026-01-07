
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
    // Balance del ciclo: Solo lo que no ha sido cortado y no es inversión
    const activeCycle = movements.filter(m => m.status === MovementStatus.PENDIENTE_CORTE);
    const ingresos = activeCycle.filter(m => m.type === MovementType.INGRESO).reduce((a, b) => a + b.amount, 0);
    const gastos = activeCycle.filter(m => m.type === MovementType.GASTO).reduce((a, b) => a + b.amount, 0);
    
    // Inversiones: Todo lo que esté "EN_CURSO" independientemente del corte
    const inversiones = movements.filter(m => m.status === MovementStatus.EN_CURSO).reduce((a, b) => a + b.amount, 0);
    
    return { balance: ingresos - gastos, inversiones };
  }, [movements]);

  const physicalTotal = useMemo(() => {
    let total = 0;
    Object.entries(vault.bills).forEach(([denom, count]) => total += Number(denom) * (count || 0));
    Object.entries(vault.coins).forEach(([denom, count]) => total += Number(denom) * (count || 0));
    return total;
  }, [vault]);

  const chartData = [
    { name: 'P1', val: stats.balance * 0.4 },
    { name: 'P2', val: stats.balance * 0.7 },
    { name: 'P3', val: stats.balance * 0.5 },
    { name: 'P4', val: stats.balance * 0.9 },
    { name: 'P5', val: stats.balance * 0.8 },
    { name: 'P6', val: stats.balance * 1.0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Panel Principal */}
      <div className="lg:col-span-2 glass rounded-[32px] p-12 text-white flex flex-col justify-between shadow-glass-panel relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-[12rem]">account_balance</span>
        </div>
        <div className="relative z-10">
          <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Balance en Sistema • Ciclo Actual</p>
          <h3 className="text-8xl font-serif font-bold italic tracking-tighter mustard-glow">
            ${stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="mt-12 h-44 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMustard" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E1AD01" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#E1AD01" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="val" stroke="#E1AD01" strokeWidth={4} fillOpacity={1} fill="url(#colorMustard)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inversiones y Acciones */}
      <div className="flex flex-col gap-8">
        <div className="glass rounded-[32px] p-10 text-white shadow-glass-panel flex-1 border-t border-white/20">
          <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-[10px] mb-3">Inversiones Activas</p>
          <h3 className="text-5xl font-serif font-bold italic mb-8 text-mustard tracking-tight">${stats.inversiones.toLocaleString()}</h3>
          <div className="space-y-5 pt-6 border-t border-white/10 text-[10px] uppercase tracking-[0.3em] font-bold opacity-50">
             <div className="flex justify-between items-center">
                <span>Riesgo</span>
                <span className="text-green-400">Controlado</span>
             </div>
             <div className="flex justify-between items-center">
                <span>Vigilancia</span>
                <span className="text-mustard">YuJo Active</span>
             </div>
          </div>
        </div>

        <button 
          onClick={onPerformCut}
          className="liquid-btn text-forest-green font-bold text-2xl py-7 rounded-[32px] flex items-center justify-center gap-4 uppercase tracking-[0.2em] hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
          Ejecutar Corte
        </button>
      </div>

      {/* Barra de Cuadre */}
      <div className="lg:col-span-3 glass rounded-[32px] p-10 flex flex-col md:flex-row items-center justify-between gap-12 border-t border-white/20 shadow-glass-panel">
        <div className="flex items-center gap-16">
           <div>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.4em] mb-2">Libros YuJo</p>
              <p className="text-white text-4xl font-serif italic font-bold tracking-tight">${stats.balance.toLocaleString()}</p>
           </div>
           <div className="h-16 w-px bg-white/10 hidden md:block"></div>
           <div>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.4em] mb-2">Conteo Bóveda</p>
              <p className="text-mustard text-4xl font-serif italic font-bold tracking-tight">${physicalTotal.toLocaleString()}</p>
           </div>
        </div>
        
        <div className="flex gap-6 w-full md:w-auto">
          <button 
            onClick={onOpenVault}
            className="flex-1 md:flex-none liquid-btn text-forest-green text-xs font-bold px-12 py-5 rounded-2xl uppercase tracking-[0.2em]"
          >
            Sellar Bóveda
          </button>
          
          {Math.abs(stats.balance - physicalTotal) < 0.01 ? (
             <div className="bg-mustard/20 text-mustard px-10 py-5 rounded-2xl flex items-center gap-3 font-bold border border-mustard/30 uppercase text-[10px] tracking-[0.3em] shadow-lg shadow-mustard/10">
                <span className="material-symbols-outlined text-lg">verified</span>
                Cuadre Perfecto
             </div>
          ) : (
             <div className="bg-red-500/20 text-red-400 px-10 py-5 rounded-2xl flex items-center gap-3 font-bold border border-red-500/30 uppercase text-[10px] tracking-[0.3em] shadow-lg shadow-red-500/10">
                <span className="material-symbols-outlined text-lg">warning</span>
                Descuadre
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
