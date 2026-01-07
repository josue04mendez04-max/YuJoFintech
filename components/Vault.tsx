
import React, { useMemo } from 'react';
import { VaultCount } from '../types';

interface VaultProps {
  count: VaultCount;
  setCount: React.Dispatch<React.SetStateAction<VaultCount>>;
}

const Vault: React.FC<VaultProps> = ({ count, setCount }) => {
  const updateBill = (denom: string, val: number) => {
    setCount(prev => ({
      ...prev,
      bills: { ...prev.bills, [denom]: Math.max(0, val) }
    }));
  };

  const updateCoin = (denom: string, val: number) => {
    setCount(prev => ({
      ...prev,
      coins: { ...prev.coins, [denom]: Math.max(0, val) }
    }));
  };

  const total = useMemo(() => {
    let t = 0;
    Object.entries(count.bills).forEach(([d, c]) => t += Number(d) * (c || 0));
    Object.entries(count.coins).forEach(([d, c]) => t += Number(d) * (c || 0));
    return t;
  }, [count]);

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto">
      <div className="glass rounded-[24px] p-6 text-center shadow-glass-panel">
        <p className="text-mustard font-bold text-[10px] uppercase tracking-[0.5em]">
          Contabilidad de Divisas • Conteo Físico
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Papel Moneda */}
        <div className="glass rounded-[24px] p-10 shadow-glass-panel">
          <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
            <h3 className="text-2xl font-serif italic text-white font-bold tracking-tight">Papel Moneda</h3>
            <span className="material-symbols-outlined text-mustard text-3xl">payments</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(count.bills).sort((a,b) => Number(b[0]) - Number(a[0])).map(([denom, val]) => (
              <div key={denom} className="bg-black/20 rounded-2xl p-6 border border-white/5 hover:border-mustard/40 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-3xl font-serif font-bold italic text-white tracking-tighter">${denom}</span>
                  <span className="text-mustard font-mono text-[11px] font-bold bg-mustard/10 px-2 py-1 rounded-lg">${(Number(denom) * (val || 0)).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateBill(denom, (val || 0) - 1)} className="w-10 h-10 rounded-xl bg-white/5 text-white hover:bg-mustard hover:text-forest-green font-bold text-xl transition-all">-</button>
                  <input 
                    type="number" 
                    value={val || ''} 
                    onChange={(e) => updateBill(denom, parseInt(e.target.value) || 0)} 
                    placeholder="0"
                    className="flex-1 bg-black/40 rounded-xl py-2 text-center text-white font-bold text-lg focus:outline-none border border-white/10 focus:border-mustard"
                  />
                  <button onClick={() => updateBill(denom, (val || 0) + 1)} className="w-10 h-10 rounded-xl bg-white/5 text-white hover:bg-mustard hover:text-forest-green font-bold text-xl transition-all">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metálico */}
        <div className="glass rounded-[24px] p-10 shadow-glass-panel">
          <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6">
            <h3 className="text-2xl font-serif italic text-white font-bold tracking-tight">Especies Metálicas</h3>
            <span className="material-symbols-outlined text-mustard text-3xl">monetization_on</span>
          </div>
          <div className="flex flex-col gap-4">
             {Object.entries(count.coins).sort((a,b) => Number(b[0]) - Number(a[0])).map(([denom, val]) => (
               <div key={denom} className="bg-black/20 rounded-2xl p-4 flex items-center justify-between border border-white/5 group hover:border-mustard/40 transition-all">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 rounded-full border-2 border-mustard/30 flex items-center justify-center text-mustard text-lg font-bold italic shadow-xl bg-mustard/5">
                        ${denom}
                     </div>
                     <div>
                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">Subtotal</p>
                        <p className="text-white font-serif italic text-xl font-bold">${(Number(denom) * (val || 0)).toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                        type="number" 
                        value={val || ''} 
                        onChange={(e) => updateCoin(denom, parseInt(e.target.value) || 0)} 
                        placeholder="0"
                        className="w-24 bg-black/40 rounded-xl text-center text-white p-3 font-bold text-xl focus:outline-none border border-white/10 focus:border-mustard" 
                    />
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* GIANT MUSTARD COUNTER */}
      <div className="sticky bottom-6 mx-auto glass rounded-[32px] p-12 shadow-[0_30px_70px_rgba(0,0,0,0.6)] border-t border-white/30 flex items-center justify-between gap-16 max-w-4xl w-full">
         <div className="flex items-center gap-12">
            <div className="w-24 h-24 rounded-[28px] bg-mustard/10 flex items-center justify-center text-mustard border border-mustard/20 shadow-lg animate-pulse">
                <span className="material-symbols-outlined text-6xl">savings</span>
            </div>
            <div>
               <p className="text-white/40 text-[11px] uppercase font-bold tracking-[0.6em] mb-1">Total Consolidado en Bóveda</p>
               <p className="text-mustard text-7xl font-serif font-bold italic tracking-tighter mustard-glow">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
         </div>
         <button 
           onClick={() => setCount({
              bills: { '1000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0 },
              coins: { '10': 0, '5': 0, '2': 0, '1': 0, '0.5': 0 }
           })} 
           className="text-white/20 hover:text-red-400 transition-all p-4 hover:bg-red-400/10 rounded-2xl"
           title="Reiniciar Conteo"
         >
            <span className="material-symbols-outlined text-5xl">refresh</span>
         </button>
      </div>
    </div>
  );
};

export default Vault;
