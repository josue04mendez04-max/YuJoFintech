
import React, { useMemo, useState } from 'react';
import { VaultCount } from '../types';
import * as FirestoreService from '../firestore.service';

interface VaultProps {
  count: VaultCount;
  setCount: React.Dispatch<React.SetStateAction<VaultCount>>;
}

const Vault: React.FC<VaultProps> = ({ count, setCount }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
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

  const handleSealVault = async () => {
    try {
      setIsSaving(true);
      await FirestoreService.saveVaultCount(count);
      setSaveMessage({ type: 'success', text: 'Bóveda sellada y guardada en Firebase ✓' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error al guardar bóveda:', error);
      setSaveMessage({ type: 'error', text: 'Error al guardar. Intenta de nuevo.' });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
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

      {/* TOTAL CONSOLIDADO EN TIEMPO REAL - VISIBLE AL INICIO */}
      <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-mustard/30 bg-gradient-to-r from-mustard/5 via-transparent to-mustard/5 flex items-center justify-between gap-4 sm:gap-6">
         <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-lg bg-mustard/10 flex items-center justify-center text-mustard border border-mustard/20 shadow-lg flex-shrink-0">
                <span className="material-symbols-outlined text-2xl sm:text-3xl">savings</span>
            </div>
            <div className="min-w-0">
               <p className="text-white/40 text-[8px] sm:text-[9px] uppercase font-bold tracking-[0.3em]">Total en Caja</p>
               <p className="text-mustard text-2xl sm:text-4xl font-serif font-bold italic">
                 ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
               </p>
            </div>
         </div>
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

      {/* BOTONES DE ACCIÓN */}
      <div className="flex justify-center gap-4 flex-wrap">
        <button 
          onClick={handleSealVault}
          disabled={isSaving}
          className="liquid-btn text-forest-green font-bold py-3 px-8 rounded-lg md:rounded-2xl uppercase tracking-[0.2em] hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">verified</span>
          {isSaving ? 'Guardando...' : 'Sellar Bóveda'}
        </button>
        
        <button 
          onClick={() => setCount({
             bills: { '1000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0 },
             coins: { '10': 0, '5': 0, '2': 0, '1': 0, '0.5': 0 }
          })} 
          className="text-white/40 hover:text-red-400 transition-all px-4 py-3 hover:bg-red-400/10 rounded-lg font-bold text-sm uppercase tracking-widest flex items-center gap-2"
          title="Reiniciar conteo"
        >
          <span className="material-symbols-outlined">refresh</span>
          Limpiar
        </button>
      </div>

      {/* MENSAJE DE ESTADO */}
      {saveMessage && (
        <div className={`glass rounded-lg p-4 text-center font-bold ${
          saveMessage.type === 'success' 
            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
            : 'bg-red-500/20 text-red-300 border border-red-500/30'
        }`}>
          {saveMessage.text}
        </div>
      )}
    </div>
  );
};

export default Vault;
