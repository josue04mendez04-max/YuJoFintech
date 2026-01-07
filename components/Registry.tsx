
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
      id: `YJ-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
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
    <div className="flex flex-col gap-12">
      {/* FORMULARIO NOTARIAL */}
      <div className="glass rounded-[32px] p-12 shadow-glass-panel relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mustard to-transparent opacity-30"></div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-1">
            <label className="block text-mustard text-[11px] font-bold uppercase tracking-widest mb-4 ml-2">Protocolo</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as MovementType })}
              className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-mustard transition-all appearance-none cursor-pointer font-medium"
            >
              <option value={MovementType.INGRESO}>Ingreso</option>
              <option value={MovementType.GASTO}>Egreso (Gasto)</option>
              <option value={MovementType.INVERSION}>Inversión</option>
            </select>
          </div>
          
          <div className="md:col-span-1">
            <label className="block text-mustard text-[11px] font-bold uppercase tracking-widest mb-4 ml-2">Monto Operado</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 font-serif text-2xl italic">$</span>
              <input
                required
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white font-serif text-3xl italic focus:outline-none focus:border-mustard transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-mustard text-[11px] font-bold uppercase tracking-widest mb-4 ml-2">Validado Por</label>
            <input
              type="text"
              readOnly
              value={formData.authorization}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-mustard/60 font-bold tracking-[0.2em] italic cursor-not-allowed"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-mustard text-[11px] font-bold uppercase tracking-widest mb-4 ml-2">Titular Responsable</label>
            <input
              required
              type="text"
              value={formData.responsible}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
              placeholder="Nombre del cliente"
              className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-8 text-white placeholder:text-white/10 focus:outline-none focus:border-mustard transition-all"
            />
          </div>

          <div className="md:col-span-2">
             <label className="block text-mustard text-[11px] font-bold uppercase tracking-widest mb-4 ml-2">Glosa de Registro</label>
             <input
               required
               type="text"
               value={formData.description}
               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               placeholder="Descripción de la transacción..."
               className="w-full bg-black/30 border border-white/10 rounded-2xl py-4 px-8 text-white placeholder:text-white/10 focus:outline-none focus:border-mustard transition-all"
             />
          </div>

          <div className="md:col-span-3 pt-4">
            <button 
              type="submit"
              className="liquid-btn w-full bg-mustard text-forest-green font-bold py-6 rounded-2xl shadow-xl flex items-center justify-center gap-4 hover:shadow-mustard/30 transition-all text-xl uppercase tracking-[0.2em]"
            >
              <span className="material-symbols-outlined font-bold text-2xl">verified</span>
              Sellar y Generar Documento
            </button>
          </div>
        </form>
      </div>

      {/* HISTORIAL NOTARIAL */}
      <div className="glass rounded-[32px] p-10 shadow-glass-panel border border-white/10 overflow-hidden">
        <div className="flex justify-between items-center mb-10 px-4">
          <h3 className="text-white/50 text-[11px] uppercase font-bold tracking-[0.4em]">Folios Activos • Notaría YuJo</h3>
          <div className="flex gap-6 text-[9px] font-bold uppercase tracking-widest text-white/40">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400"></div> Ingresos</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"></div> Gastos</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-mustard"></div> Inversiones</div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-6 px-6 text-mustard text-[10px] uppercase font-bold tracking-widest">Folio</th>
                <th className="py-6 px-6 text-mustard text-[10px] uppercase font-bold tracking-widest">Responsable</th>
                <th className="py-6 px-6 text-mustard text-[10px] uppercase font-bold tracking-widest">Concepto</th>
                <th className="py-6 px-6 text-mustard text-[10px] uppercase font-bold tracking-widest text-right">Monto</th>
                <th className="py-6 px-6 text-mustard text-[10px] uppercase font-bold tracking-widest text-center">Protocolo</th>
              </tr>
            </thead>
            <tbody className="text-white divide-y divide-white/5">
              {activeMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center text-white/10 italic font-serif text-2xl tracking-[0.2em]">Cámara Notarial Vacía</td>
                </tr>
              ) : (
                activeMovements.map((m) => (
                  <tr key={m.id} className="group hover:bg-white/5 transition-all">
                    <td className="py-6 px-6 font-mono text-[10px] text-white/20">{m.id}</td>
                    <td className="py-6 px-6 text-sm font-medium tracking-tight uppercase">{m.responsible}</td>
                    <td className="py-6 px-6">
                      <p className="text-sm truncate max-w-[250px] font-medium">{m.description}</p>
                      <p className="text-[9px] text-white/20 uppercase font-bold mt-1 tracking-widest">{m.date}</p>
                    </td>
                    <td className={`py-6 px-6 text-right font-serif italic font-bold text-xl ${m.type === MovementType.INGRESO ? 'text-green-400' : m.type === MovementType.GASTO ? 'text-red-400' : 'text-mustard'}`}>
                      {m.type === MovementType.GASTO ? '-' : ''}${m.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex justify-center gap-3">
                        <button onClick={() => onPrint(m)} title="Imprimir" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/30 hover:text-mustard hover:bg-mustard/10 transition-all"><span className="material-symbols-outlined text-base">print</span></button>
                        {m.type === MovementType.INVERSION && (
                           <button onClick={() => onReturnInvestment(m)} title="Devolver Capital" className="w-10 h-10 flex items-center justify-center rounded-xl bg-mustard/20 text-mustard hover:scale-110 shadow-lg shadow-mustard/20 transition-all"><span className="material-symbols-outlined text-base font-bold">keyboard_return</span></button>
                        )}
                        <button onClick={() => onEdit(m.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/20 hover:text-white transition-all"><span className="material-symbols-outlined text-base">edit</span></button>
                        <button onClick={() => onDelete(m.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/20 hover:text-red-400 transition-all"><span className="material-symbols-outlined text-base">delete</span></button>
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
