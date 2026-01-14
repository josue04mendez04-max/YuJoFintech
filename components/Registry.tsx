
import React, { useState } from 'react';
import { Movement, MovementType, MovementStatus } from '../types';

interface RegistryProps {
  movements: Movement[];
  onSave: (m: Movement) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPrint: (m: Movement) => void;
  onReturnInvestment: (m: Movement) => void;
}

const Registry: React.FC<RegistryProps> = ({ movements, onSave, onEdit, onDelete, onPrint, onReturnInvestment }) => {
  const [formData, setFormData] = useState({
    type: MovementType.INGRESO,
    amount: '',
    description: '',
    responsible: '',
    authorization: 'Josué M.',
    date: new Date().toISOString().split('T')[0]
  });

  const activeMovements = movements.filter(m => m.status !== MovementStatus.ARCHIVADO);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMovement: Movement = {
      id: `YJ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      responsible: formData.responsible || 'Invitado',
      authorization: formData.authorization,
      date: formData.date,
      status: formData.type === MovementType.INVERSION ? MovementStatus.EN_CURSO : MovementStatus.PENDIENTE_CORTE
    };
    onSave(newMovement);
    setFormData({ ...formData, amount: '', description: '', responsible: '' });
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-12 px-2 sm:px-0">
      {/* FORMULARIO NOTARIAL */}
      <div className="glass rounded-lg sm:rounded-2xl md:rounded-[32px] p-4 sm:p-8 md:p-12 shadow-glass-panel relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mustard to-transparent opacity-30"></div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 md:gap-10">
          <div className="sm:col-span-1">
            <label className="block text-mustard text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-2 sm:mb-4 ml-2">Protocolo</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as MovementType })}
              className="w-full bg-black/30 border border-white/10 rounded-lg sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-6 text-white text-sm focus:outline-none focus:border-mustard transition-all appearance-none cursor-pointer font-medium"
            >
              <option value={MovementType.INGRESO}>Ingreso</option>
              <option value={MovementType.GASTO}>Egreso</option>
              <option value={MovementType.INVERSION}>Inversión</option>
            </select>
          </div>
          
          <div className="sm:col-span-1">
            <label className="block text-mustard text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-2 sm:mb-4 ml-2">Monto</label>
            <div className="relative">
              <span className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-white/40 font-serif text-lg sm:text-2xl italic">$</span>
              <input
                required
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-lg sm:rounded-2xl py-3 sm:py-4 pl-8 sm:pl-12 pr-4 sm:px-6 text-white font-serif text-xl sm:text-3xl italic focus:outline-none focus:border-mustard transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="sm:col-span-1 hidden sm:block">
            <label className="block text-mustard text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-2 sm:mb-4 ml-2">Validado Por</label>
            <input
              type="text"
              readOnly
              value={formData.authorization}
              className="w-full bg-white/5 border border-white/5 rounded-lg sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-6 text-mustard/60 font-bold tracking-[0.2em] text-xs sm:text-sm italic cursor-not-allowed"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="block text-mustard text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-2 sm:mb-4 ml-2">Responsable</label>
            <input
              required
              type="text"
              value={formData.responsible}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
              placeholder="Nombre"
              className="w-full bg-black/30 border border-white/10 rounded-lg sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-8 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-mustard transition-all"
            />
          </div>

          <div className="sm:col-span-2 md:col-span-2">
             <label className="block text-mustard text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-2 sm:mb-4 ml-2">Glosa de Registro</label>
             <input
               required
               type="text"
               value={formData.description}
               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               placeholder="Descripción..."
               className="w-full bg-black/30 border border-white/10 rounded-lg sm:rounded-2xl py-3 sm:py-4 px-4 sm:px-8 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-mustard transition-all"
             />
          </div>

          <div className="sm:col-span-2 md:col-span-3 pt-2 sm:pt-4">
            <button 
              type="submit"
              className="liquid-btn w-full bg-mustard text-forest-green font-bold py-4 sm:py-6 rounded-lg sm:rounded-2xl shadow-xl flex items-center justify-center gap-2 sm:gap-4 hover:shadow-mustard/30 transition-all text-sm sm:text-base md:text-xl uppercase tracking-[0.2em]"
            >
              <span className="material-symbols-outlined font-bold text-lg sm:text-2xl">verified</span>
              <span className="hidden sm:inline">Sellar y Generar Documento</span>
              <span className="sm:hidden">Sellar</span>
            </button>
          </div>
        </form>
      </div>

      {/* HISTORIAL NOTARIAL */}
      <div className="glass rounded-lg sm:rounded-2xl md:rounded-[32px] p-4 sm:p-10 shadow-glass-panel border border-white/10 overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-10 px-2 sm:px-4">
          <h3 className="text-white/50 text-[10px] sm:text-[11px] uppercase font-bold tracking-[0.4em]">Folios Activos • YuJo</h3>
          <div className="hidden md:flex gap-6 text-[9px] font-bold uppercase tracking-widest text-white/40">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400"></div> Ingresos</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"></div> Gastos</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-mustard"></div> Inversiones</div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 sm:py-6 px-3 sm:px-6 text-mustard text-[8px] sm:text-[10px] uppercase font-bold tracking-widest">Folio</th>
                <th className="py-3 sm:py-6 px-3 sm:px-6 text-mustard text-[8px] sm:text-[10px] uppercase font-bold tracking-widest hidden sm:table-cell">Responsable</th>
                <th className="py-3 sm:py-6 px-3 sm:px-6 text-mustard text-[8px] sm:text-[10px] uppercase font-bold tracking-widest">Concepto</th>
                <th className="py-3 sm:py-6 px-3 sm:px-6 text-mustard text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-right">Monto</th>
                <th className="py-3 sm:py-6 px-3 sm:px-6 text-mustard text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-white divide-y divide-white/5">
              {activeMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 sm:py-32 text-center text-white/10 italic font-serif text-lg sm:text-2xl tracking-[0.2em]">Cámara Vacía</td>
                </tr>
              ) : (
                activeMovements.map((m) => (
                  <tr key={m.id} className="group hover:bg-white/5 transition-all">
                    <td className="py-3 sm:py-6 px-3 sm:px-6 font-mono text-[8px] sm:text-[10px] text-white/20">{m.id}</td>
                    <td className="py-3 sm:py-6 px-3 sm:px-6 text-xs sm:text-sm font-medium tracking-tight uppercase hidden sm:table-cell">{m.responsible}</td>
                    <td className="py-3 sm:py-6 px-3 sm:px-6">
                      <p className="text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[250px] font-medium">{m.description}</p>
                      <p className="text-[8px] sm:text-[9px] text-white/20 uppercase font-bold mt-1 tracking-widest hidden sm:block">{m.date}</p>
                    </td>
                    <td className={`py-3 sm:py-6 px-3 sm:px-6 text-right font-serif italic font-bold text-sm sm:text-xl ${m.type === MovementType.INGRESO ? 'text-green-400' : m.type === MovementType.GASTO ? 'text-red-400' : 'text-mustard'}`}>
                      {m.type === MovementType.GASTO ? '-' : ''}${m.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 sm:py-6 px-3 sm:px-6">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => onPrint(m)} title="Imprimir" className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-white/5 text-white/30 hover:text-mustard hover:bg-mustard/10 transition-all"><span className="material-symbols-outlined text-sm sm:text-base">print</span></button>
                        {m.type === MovementType.INVERSION && (
                           <button onClick={() => onReturnInvestment(m)} title="Devolver" className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-mustard/20 text-mustard hover:scale-110 shadow-lg shadow-mustard/20 transition-all hidden sm:flex"><span className="material-symbols-outlined text-sm sm:text-base font-bold">keyboard_return</span></button>
                        )}
                        <button onClick={() => onEdit(m.id)} className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-white/5 text-white/20 hover:text-white transition-all hidden sm:flex"><span className="material-symbols-outlined text-sm sm:text-base">edit</span></button>
                        <button onClick={() => onDelete(m.id)} className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl bg-white/5 text-white/20 hover:text-red-400 transition-all hidden sm:flex"><span className="material-symbols-outlined text-sm sm:text-base">delete</span></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Registry;
