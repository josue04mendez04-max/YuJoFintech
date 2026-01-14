
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
    // Balance del ciclo: Solo lo que no ha sido cortado
    const activeCycle = movements.filter(m => m.status === MovementStatus.PENDIENTE_CORTE);
    const ingresos = activeCycle.filter(m => m.type === MovementType.INGRESO).reduce((a, b) => a + b.amount, 0);
    const gastos = activeCycle.filter(m => m.type === MovementType.GASTO).reduce((a, b) => a + b.amount, 0);
    
    // Inversiones salientes del ciclo actual (dinero que salió como inversión)
    const inversionesSalientes = activeCycle
      .filter(m => m.type === MovementType.INVERSION)
      .reduce((a, b) => a + b.amount, 0);
    
    // PASO 3: Separar en tres cubetas
    
    // 1. Efectivo en Mano (Caja): 
    // Sumatoria(Ingresos) - Sumatoria(Gastos) - Sumatoria(Inversiones Salientes)
    const efectivoEnMano = ingresos - gastos - inversionesSalientes;
    
    // 2. Capital en la Calle (Inversiones Activas):
    // Sumatoria de todas las inversiones con status 'ACTIVA'
    // Incluye ACTIVA y PENDIENTE_RETORNO para inversiones antiguas
    const capitalEnLaCalle = inversiones
      .filter(i => i.status === 'ACTIVA' || i.status === 'PENDIENTE_RETORNO')
      .reduce((a, b) => a + b.monto, 0);
    
    // 3. PATRIMONIO TOTAL: Efectivo en Mano + Capital en la Calle
    const patrimonioTotal = efectivoEnMano + capitalEnLaCalle;
    
    // Cálculo de ROI para inversiones liquidadas o completadas
    const inversionesLiquidadas = inversiones.filter(i => 
      (i.status === 'LIQUIDADA' || i.status === 'COMPLETADA') && i.montoRetornado
    );
    const totalInvertido = inversionesLiquidadas.reduce((a, b) => a + b.monto, 0);
    const totalRetornado = inversionesLiquidadas.reduce((a, b) => a + (b.montoRetornado || 0), 0);
    const gananciaTotal = totalRetornado - totalInvertido;
    const roiPorcentaje = totalInvertido > 0 ? ((gananciaTotal / totalInvertido) * 100) : 0;
    
    return { 
      efectivoEnMano,           // Dinero físico disponible
      capitalEnLaCalle,         // Dinero en inversiones activas
      patrimonioTotal,          // Total de patrimonio
      balance: patrimonioTotal, // Para compatibilidad con código existente
      inversionesCongeladas: capitalEnLaCalle, // Para compatibilidad
      roi: {
        porcentaje: roiPorcentaje,
        gananciaTotal,
        totalInvertido,
        totalRetornado,
        cantidadInversiones: inversionesLiquidadas.length
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

  const chartData = [
    { name: 'P1', val: stats.balance * 0.4 },
    { name: 'P2', val: stats.balance * 0.7 },
    { name: 'P3', val: stats.balance * 0.5 },
    { name: 'P4', val: stats.balance * 0.9 },
    { name: 'P5', val: stats.balance * 0.8 },
    { name: 'P6', val: stats.balance * 1.0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-10">
      {/* Panel Principal - Patrimonio Total */}
      <div className="lg:col-span-2 glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-4 sm:p-8 md:p-12 text-white flex flex-col justify-between shadow-glass-panel relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 sm:p-12 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-[4rem] sm:text-[8rem] md:text-[12rem]">account_balance</span>
        </div>
        <div className="relative z-10">
          <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-[8px] sm:text-[9px] md:text-[10px] mb-2 sm:mb-4">Patrimonio Total • Ciclo Actual</p>
          <h3 className="text-3xl sm:text-5xl md:text-8xl font-serif font-bold italic tracking-tighter mustard-glow">
            ${stats.patrimonioTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-6 text-[10px] sm:text-xs">
            <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <p className="text-white/40 uppercase tracking-widest mb-1">Efectivo en Mano</p>
              <p className="text-white font-serif font-bold">${stats.efectivoEnMano.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <p className="text-white/40 uppercase tracking-widest mb-1">Capital en la Calle</p>
              <p className="text-mustard font-serif font-bold">${stats.capitalEnLaCalle.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-8 md:mt-12 h-24 sm:h-32 md:h-44 w-full relative z-10">
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
      <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
        <div className="glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-5 sm:p-8 md:p-10 text-white shadow-glass-panel flex-1 border-t border-white/20">
          <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-[8px] sm:text-[9px] md:text-[10px] mb-2 sm:mb-3">Inversiones Activas</p>
          <h3 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold italic mb-4 sm:mb-8 text-mustard tracking-tight">${stats.inversionesCongeladas.toLocaleString()}</h3>
          <div className="space-y-3 sm:space-y-5 pt-3 sm:pt-6 border-t border-white/10 text-[8px] sm:text-[10px] uppercase tracking-[0.3em] font-bold opacity-50">
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

        {/* ROI Card - Utilidad por Inversión */}
        {stats.roi.cantidadInversiones > 0 && (
          <div className="glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-5 sm:p-8 md:p-10 text-white shadow-glass-panel border-t border-green-500/20">
            <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-[8px] sm:text-[9px] md:text-[10px] mb-2 sm:mb-3">Utilidad por Inversión</p>
            <div className="flex items-baseline gap-2 mb-4 sm:mb-6">
              <h3 className={`text-2xl sm:text-3xl md:text-4xl font-serif font-bold italic tracking-tight ${
                stats.roi.porcentaje >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {stats.roi.porcentaje >= 0 ? '+' : ''}{stats.roi.porcentaje.toFixed(1)}%
              </h3>
              <span className="text-white/40 text-[8px] sm:text-[10px] uppercase font-bold">ROI</span>
            </div>
            <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-white/10 text-[8px] sm:text-[10px]">
              <div className="flex justify-between items-center text-white/60">
                <span>Invertido</span>
                <span className="font-serif text-white">${stats.roi.totalInvertido.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-white/60">
                <span>Retornado</span>
                <span className="font-serif text-green-300">${stats.roi.totalRetornado.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-white/60 pt-2 border-t border-white/5">
                <span className="uppercase font-bold">Ganancia</span>
                <span className={`font-serif font-bold ${stats.roi.gananciaTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Math.abs(stats.roi.gananciaTotal).toLocaleString()}
                </span>
              </div>
              <div className="text-center text-white/30 text-[7px] sm:text-[8px] pt-2">
                {stats.roi.cantidadInversiones} {stats.roi.cantidadInversiones === 1 ? 'inversión completada' : 'inversiones completadas'}
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={onPerformCut}
          className="liquid-btn text-forest-green font-bold text-sm sm:text-lg md:text-2xl py-4 sm:py-5 md:py-7 rounded-lg sm:rounded-2xl md:rounded-[32px] flex items-center justify-center gap-2 sm:gap-4 uppercase tracking-[0.2em] hover:scale-[1.02] w-full"
        >
          <span className="material-symbols-outlined text-xl sm:text-2xl md:text-3xl">account_balance_wallet</span>
          <span className="hidden sm:inline">Ejecutar Corte</span>
          <span className="sm:hidden">Corte</span>
        </button>
      </div>

      {/* Barra de Cuadre */}
      <div className="lg:col-span-3 glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-4 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8 md:gap-12 border-t border-white/20 shadow-glass-panel">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-16 w-full md:w-auto">
           <div>
              <p className="text-white/40 text-[8px] sm:text-[10px] uppercase font-bold tracking-[0.4em] mb-1 sm:mb-2">Efectivo en Mano</p>
              <p className="text-white text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold tracking-tight">${stats.efectivoEnMano.toLocaleString()}</p>
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
          
          {Math.abs(stats.efectivoEnMano - physicalTotal) < 0.01 ? (
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
