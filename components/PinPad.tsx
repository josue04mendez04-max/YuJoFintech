
import React, { useState } from 'react';

interface PinPadProps {
  message: string;
  onSuccess: () => void;
  onClose: () => void;
}

const PinPad: React.FC<PinPadProps> = ({ message, onSuccess, onClose }) => {
  const [pin, setPin] = useState('');
  const MASTER_PIN = '1234';

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin === MASTER_PIN) {
        onSuccess();
      } else if (newPin.length === 4) {
        alert("Contraseña Maestra incorrecta.");
        setPin('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-forest-green/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="max-w-xs w-full glass rounded-lg sm:rounded-2xl md:rounded-[32px] p-6 sm:p-10 shadow-2xl border border-white/10">
        <div className="text-center mb-6 sm:mb-8">
          <span className="material-symbols-outlined text-mustard text-4xl sm:text-5xl mb-4 sm:mb-6 animate-pulse inline-block">lock_person</span>
          <h2 className="text-white text-lg sm:text-xl font-serif font-bold italic mb-2 sm:mb-3">Seguridad YuJo</h2>
          <p className="text-white/60 text-xs sm:text-sm italic leading-relaxed px-2">"{message}"</p>
        </div>

        <div className="flex justify-center gap-3 sm:gap-5 mb-8 sm:mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-mustard/50 transition-all duration-300 ${
                pin.length >= i ? 'bg-mustard scale-150 shadow-[0_0_10px_rgba(225,173,1,0.5)]' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-10">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((btn, idx) => (
            <button
              key={idx}
              disabled={!btn}
              onClick={() => btn === '⌫' ? setPin(pin.slice(0, -1)) : handlePress(btn)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl font-bold transition-all ${
                !btn ? 'opacity-0 cursor-default' : 'bg-white/5 text-white hover:bg-mustard hover:text-forest-green active:scale-90 border border-white/5 min-h-[40px]'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>

        <button 
          onClick={onClose}
          className="w-full text-white/30 hover:text-white transition-colors text-[10px] uppercase tracking-[0.3em] font-bold py-2"
        >
          Abortar
        </button>
      </div>
    </div>
  );
};

export default PinPad;
