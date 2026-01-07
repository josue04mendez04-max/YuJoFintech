
import React from 'react';

interface SidebarProps {
  currentView: 'dashboard' | 'notaria' | 'contabilidad' | 'corte';
  setView: (view: 'dashboard' | 'notaria' | 'contabilidad' | 'corte') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'dashboard', label: 'El Atrio', icon: 'dashboard' },
    { id: 'notaria', label: 'La Notaría', icon: 'edit_document' },
    { id: 'contabilidad', label: 'Contabilidad', icon: 'calculate' },
    { id: 'corte', label: 'Corte de Caja', icon: 'receipt_long' },
  ];

  return (
    <aside className="w-64 glass m-4 rounded-3xl p-6 flex flex-col gap-8 no-print shadow-xl">
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
            onClick={() => setView(item.id as any)}
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
        <p className="text-white/80 text-sm leading-relaxed italic">
          "Bienvenido Josué. Tu patrimonio bajo control."
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
