
import React, { useState } from 'react';

interface SidebarProps {
  currentView: 'dashboard' | 'notaria' | 'contabilidad' | 'corte' | 'historialCortes';
  setView: (view: 'dashboard' | 'notaria' | 'contabilidad' | 'corte' | 'historialCortes') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { id: 'dashboard', label: 'El Atrio', icon: 'dashboard' },
    { id: 'notaria', label: 'La Notaría', icon: 'edit_document' },
    { id: 'contabilidad', label: 'Contabilidad', icon: 'calculate' },
    { id: 'corte', label: 'Corte de Caja', icon: 'receipt_long' },
    { id: 'historialCortes', label: 'Historial de Cortes', icon: 'history' },
  ];

  const handleNavClick = (id: string) => {
    setView(id as any);
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón hamburguesa visible solo en móviles */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 flex items-center justify-center glass rounded-2xl no-print"
      >
        <span className="material-symbols-outlined text-white text-2xl">
          {isOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 no-print"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 glass m-4 rounded-3xl p-6 flex flex-col gap-8 no-print shadow-xl fixed md:static z-40 transition-all duration-300 h-screen md:h-auto md:rounded-3xl
        ${isOpen ? 'left-0 top-0' : '-left-80 top-0'} md:left-0 md:translate-x-0`}
      >
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-mustard rounded-xl flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined">spa</span>
          </div>
          <h2 className="text-white font-serif text-xl font-bold tracking-tight">YuJo<span className="font-light opacity-70">Fintech</span></h2>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
                currentView === item.id 
                  ? 'bg-mustard text-forest-green font-bold shadow-lg' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/10">
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">Concierge</p>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed italic">
            "Bienvenido Josué. Tu patrimonio bajo control."
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
