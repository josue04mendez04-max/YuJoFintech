
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
    <div className="flex flex-col gap-4 sm:gap-6 max-w-full lg:max-w-6xl mx-auto px-2 sm:px-4">
      <div className="glass rounded-lg sm:rounded-xl p-3 sm:p-4 text-center shadow-glass-panel">
        <p className="text-mustard font-bold text-[8px] sm:text-[9px] uppercase tracking-[0.4em]">
          Contabilidad • Conteo Físico
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Papel Moneda */}
        <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-glass-panel">
          <div className="flex justify-between items-center mb-4 sm:mb-5 border-b border-white/10 pb-2 sm:pb-3">
            <h3 className="text-base sm:text-lg font-serif italic text-white font-bold">Papel Moneda</h3>
            <span className="material-symbols-outlined text-mustard text-lg sm:text-xl">payments</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {Object.entries(count.bills).sort((a,b) => Number(b[0]) - Number(a[0])).map(([denom, val]) => (
              <div key={denom} className="bg-black/30 rounded-lg p-2 sm:p-3 border border-white/5 hover:border-mustard/40 transition-all">
                <div className="text-center mb-2">
                  <p className="text-base sm:text-lg font-serif font-bold italic text-white">${denom}</p>
                  <p className="text-mustard font-mono text-[8px] sm:text-[10px] font-bold">${(Number(denom) * (val || 0)).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 justify-center">
                  <button onClick={() => updateBill(denom, (val || 0) - 1)} className="w-6 sm:w-7 h-6 sm:h-7 rounded-md bg-white/5 text-white hover:bg-mustard hover:text-forest-green font-bold text-sm transition-all">-</button>
                  <input 
                    type="number" 
                    value={val || ''} 
                    onChange={(e) => updateBill(denom, parseInt(e.target.value) || 0)} 
                    placeholder="0"
                    className="w-10 sm:w-12 bg-black/40 rounded-md py-1 text-center text-white font-bold text-sm focus:outline-none border border-white/10 focus:border-mustard"
                  />
                  <button onClick={() => updateBill(denom, (val || 0) + 1)} className="w-6 sm:w-7 h-6 sm:h-7 rounded-md bg-white/5 text-white hover:bg-mustard hover:text-forest-green font-bold text-sm transition-all">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metálico */}
        <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-glass-panel">
          <div className="flex justify-between items-center mb-4 sm:mb-5 border-b border-white/10 pb-2 sm:pb-3">
            <h3 className="text-base sm:text-lg font-serif italic text-white font-bold">Metálico</h3>
            <span className="material-symbols-outlined text-mustard text-lg sm:text-xl">monetization_on</span>
          </div>
          <div className="flex flex-col gap-2">
             {Object.entries(count.coins).sort((a,b) => Number(b[0]) - Number(a[0])).map(([denom, val]) => (
               <div key={denom} className="bg-black/30 rounded-lg p-2 sm:p-3 flex items-center justify-between border border-white/5 hover:border-mustard/40 transition-all">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                     <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full border border-mustard/30 flex items-center justify-center text-mustard text-xs sm:text-sm font-bold italic bg-mustard/5">
                        ${denom}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-white/40 text-[8px] uppercase font-bold">Subtotal</p>
                        <p className="text-white font-serif italic text-xs sm:text-sm font-bold">${(Number(denom) * (val || 0)).toLocaleString()}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <input 
                        type="number" 
                        value={val || ''} 
                        onChange={(e) => updateCoin(denom, parseInt(e.target.value) || 0)} 
                        placeholder="0"
                        className="w-12 sm:w-14 bg-black/40 rounded-md text-center text-white p-1 font-bold text-sm focus:outline-none border border-white/10 focus:border-mustard" 
                    />
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vault;
