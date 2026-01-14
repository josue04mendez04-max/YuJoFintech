
import React, { useMemo } from 'react';
import { Movement, MovementType, MovementStatus, VaultCount, Inversion } from '../types';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  movements: Movement[];
  inversiones: Inversion[];
  vault: VaultCount;
  onOpenVault: () => void;
  onPerformCut: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ movements, inversiones, vault, onOpenVault, onPerformCut }) => {
  const stats = useMemo(() => {
    // 1. Filtrar movimientos del ciclo actual (lo que no se ha cortado)
    const activeCycle = movements.filter(m => m.status === MovementStatus.PENDIENTE_CORTE);
    
    // 2. Calcular Ingresos y Gastos normales
    const ingresos = activeCycle
      .filter(m => m.type === MovementType.INGRESO)
      .reduce((a, b) => a + b.amount, 0);
      
    const gastos = activeCycle
      .filter(m => m.type === MovementType.GASTO)
      .reduce((a, b) => a + b.amount, 0);
    
    // 3. Calcular Inversiones Activas (Dinero que tiene tu hermano)
    // Buscamos movimientos de tipo INVERSION que estén EN CURSO (no liquidadas)
    const inversionesCongeladas = movements
      .filter(m => m.type === MovementType.INVERSION && m.status === MovementStatus.EN_CURSO)
      .reduce((a, b) => a + b.amount, 0);
    
    // 4. Calcular el "Total en Físico" (Lo que deberías tener en la caja)
    // Físico = Ingresos - Gastos - Lo que salió para inversión
    const totalFisico = ingresos - gastos - inversionesCongeladas;

    // 5. Calcular "Patrimonio Total" (Tu dinero real)
    // Patrimonio = Lo que tienes en físico + Lo que tienes invertido
    const patrimonioTotal = totalFisico + inversionesCongeladas;

    // Estadísticas de ROI (Retorno de Inversión) para las que ya volvieron
    const inversionesCompletadas = inversiones.filter(i => i.status === 'COMPLETADA' && i.montoRetornado);
    const totalInvertidoHist = inversionesCompletadas.reduce((a, b) => a + b.monto, 0);
    const totalRetornadoHist = inversionesCompletadas.reduce((a, b) => a + (b.montoRetornado || 0), 0);
    const gananciaTotal = totalRetornadoHist - totalInvertidoHist;
    const roiPorcentaje = totalInvertidoHist > 0 ? ((gananciaTotal / totalInvertidoHist) * 100) : 0;
    
    return { 
      patrimonioTotal,       // TU DINERO REAL (Número Grande)
      totalFisico,           // TU CAJA (Número Pequeño 1)
      inversionesCongeladas, // TU INVERSIÓN (Número Pequeño 2)
      roi: {
        porcentaje: roiPorcentaje,
        gananciaTotal,
        cantidadInversiones: inversionesCompletadas.length
      }
    };
  }, [movements, inversiones]);

  const physicalTotal = useMemo(() => {
    if (!vault) return 0;
    let total = 0;
    Object.entries(vault.bills || {}).forEach(([denom, count]) => total += Number(denom) * (count || 0));
    Object.entries(vault.coins || {}).forEach(([denom, count]) => total += Number(denom) * (count || 0));
    return total;
  }, [vault]);

  // Datos para la gráfica (simulados basados en el patrimonio)
  const chartData = [
    { name: 'Inicio', val: stats.patrimonioTotal * 0.9 },
    { name: 'Actual', val: stats.patrimonioTotal },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-10">
      {/* Panel Principal - Muestra el PATRIMONIO (Suma de todo) */}
      <div className="lg:col-span-2 glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-4 sm:p-8 md:p-12 text-white flex flex-col justify-between shadow-glass-panel relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-[4rem] sm:text-[8rem] md:text-[12rem]">account_balance_wallet</span>
        </div>
        
        <div className="relative z-10">
          <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-[8px] sm:text-[9px] md:text-[10px] mb-2 sm:mb-4">
            Patrimonio Total (Caja + Inversiones)
          </p>
          <h3 className="text-3xl sm:text-5xl md:text-8xl font-serif font-bold italic tracking-tighter text-white">
            ${stats.patrimonioTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          
          {/* Desglose: Físico vs Inversión */}
          <div className="flex gap-8 mt-6">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">En Caja (Físico)</p>
              <p className={`text-2xl font-bold font-serif ${stats.totalFisico < 0 ? 'text-red-400' : 'text-green-400'}`}>
                ${stats.totalFisico.toLocaleString()}
              </p>
            </div>
            <div className="border-l border-white/10 pl-8">
              <p className="text-mustard/60 text-xs uppercase tracking-widest mb-1">En Inversiones</p>
              <p className="text-2xl font-bold font-serif text-mustard">
                ${stats.inversionesCongeladas.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-8 md:mt-12 h-24 sm:h-32 md:h-44 w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPatrimonio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="val" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorPatrimonio)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Panel Lateral - Acciones Rápidas */}
      <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
        {/* Tarjeta de Inversiones */}
        <div className="glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-5 sm:p-8 md:p-10 text-white shadow-glass-panel flex-1 border-t border-mustard/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-mustard font-bold uppercase tracking-[0.4em] text-[8px] sm:text-[9px] md:text-[10px] mb-2">
                Capital Invertido
              </p>
              <h3 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold italic text-white">
                ${stats.inversionesCongeladas.toLocaleString()}
              </h3>
            </div>
            <span className="material-symbols-outlined text-mustard text-3xl">trending_up</span>
          </div>
          
          <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Ganancia Histórica</p>
            <p className="text-green-400 font-bold text-xl">+${stats.roi.gananciaTotal.toLocaleString()}</p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={onPerformCut}
              className="glass p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all group border border-white/10"
            >
              <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">content_cut</span>
              <span className="text-xs font-bold uppercase tracking-wider">Corte Caja</span>
            </button>
            <button 
              onClick={onOpenVault}
              className="glass p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-all group border border-white/10"
            >
              <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">lock</span>
              <span className="text-xs font-bold uppercase tracking-wider">Bóveda</span>
            </button>
        </div>
      </div>

      {/* Barra de Cuadre */}
      <div className="lg:col-span-3 glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-4 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8 md:gap-12 border-t border-white/20 shadow-glass-panel">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-16 w-full md:w-auto">
           <div>
              <p className="text-white/40 text-[8px] sm:text-[10px] uppercase font-bold tracking-[0.4em] mb-1 sm:mb-2">Libros YuJo</p>
              <p className="text-white text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold tracking-tight">${stats.totalFisico.toLocaleString()}</p>
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
          
          {Math.abs(stats.totalFisico - physicalTotal) < 0.01 ? (
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
      </div>
    </div>
  );
};

export default Dashboard;
