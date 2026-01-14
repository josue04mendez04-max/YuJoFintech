
import React, { useState } from 'react';
import { Inversion, InversionStatus, Movement, MovementType, MovementStatus } from '../types';

interface InvestmentManagerProps {
  inversiones: Inversion[];
  onCreateInvestment: (inversion: Inversion, movement: Movement) => void;
  onReturnInvestment: (inversion: Inversion, montoRetornado: number) => void;
}

const InvestmentManager: React.FC<InvestmentManagerProps> = ({ 
  inversiones, 
  onCreateInvestment, 
  onReturnInvestment 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    monto: '',
    descripcion: '',
    tipo: 'Proyecto' as const,
    responsable: '',
    fechaEstimadaRetorno: '',
    notas: ''
  });

  const activeInversiones = inversiones.filter(i => i.status !== InversionStatus.COMPLETADA);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use crypto.randomUUID if available, otherwise fall back to timestamp-based ID
    const inversionId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? `INV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
      : `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const monto = parseFloat(formData.monto);
    
    // Crear la inversión
    const newInversion: Inversion = {
      id: inversionId,
      monto,
      descripcion: formData.descripcion,
      tipo: formData.tipo,
      responsable: formData.responsable || 'Invitado',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaEstimadaRetorno: formData.fechaEstimadaRetorno || undefined,
      status: InversionStatus.ACTIVA,
      notas: formData.notas || undefined,
      timestamp: new Date().toISOString()
    };

    // Crear el movimiento de salida de dinero (GASTO que representa la inversión)
    const salidaMovement: Movement = {
      id: `SAL-${inversionId}`,
      type: MovementType.INVERSION,
      category: 'Inversión Activa',
      amount: monto,
      description: `INVERSIÓN: ${formData.descripcion}`,
      responsible: formData.responsable || 'Invitado',
      authorization: 'Josué M.',
      date: new Date().toISOString().split('T')[0],
      status: MovementStatus.EN_CURSO
    };

    onCreateInvestment(newInversion, salidaMovement);
    
    // Reset form
    setFormData({
      monto: '',
      descripcion: '',
      tipo: 'Proyecto',
      responsable: '',
      fechaEstimadaRetorno: '',
      notas: ''
    });
    setShowForm(false);
  };

  const handleReturnClick = (inv: Inversion) => {
    const montoRetornadoStr = prompt(
      `Retorno de inversión: ${inv.descripcion}\n\nMonto original invertido: $${inv.monto.toLocaleString()}\n\nJosué, ingresa el monto TOTAL recibido (incluyendo ganancia):`,
      inv.monto.toString()
    );
    
    if (montoRetornadoStr && !isNaN(parseFloat(montoRetornadoStr))) {
      const montoRetornado = parseFloat(montoRetornadoStr);
      
      if (montoRetornado < inv.monto) {
        const confirm = window.confirm(
          `⚠ ADVERTENCIA: El monto retornado ($${montoRetornado}) es menor que el monto invertido ($${inv.monto}).\n\n¿Deseas continuar de todas formas?`
        );
        if (!confirm) return;
      }
      
      onReturnInvestment(inv, montoRetornado);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-12 px-2 sm:px-0">
      {/* Botón Nueva Inversión */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-white text-2xl sm:text-3xl font-serif font-bold italic mb-2">Gestión de Inversiones</h2>
          <p className="text-white/50 text-xs sm:text-sm">Dinero que sale de caja y volverá con rendimiento</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="liquid-btn bg-mustard text-forest-green font-bold px-6 sm:px-10 py-3 sm:py-4 rounded-xl flex items-center gap-2 text-sm uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          <span className="hidden sm:inline">Nueva Inversión</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {/* Formulario de Nueva Inversión */}
      {showForm && (
        <div className="glass rounded-2xl md:rounded-[32px] p-6 sm:p-10 shadow-glass-panel border border-mustard/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mustard to-transparent opacity-50"></div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-mustard text-[10px] font-bold uppercase tracking-widest mb-3 ml-2">Descripción de la Inversión</label>
              <input
                required
                type="text"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Ej: Compra-venta con hermano, Capital de trabajo..."
                className="w-full bg-black/30 border border-white/10 rounded-xl py-4 px-6 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-mustard transition-all"
              />
            </div>

            <div>
              <label className="block text-mustard text-[10px] font-bold uppercase tracking-widest mb-3 ml-2">Monto a Invertir</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 font-serif text-2xl italic">$</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-white font-serif text-2xl italic focus:outline-none focus:border-mustard transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-mustard text-[10px] font-bold uppercase tracking-widest mb-3 ml-2">Tipo de Inversión</label>
              <select 
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="w-full bg-black/30 border border-white/10 rounded-xl py-4 px-6 text-white text-sm focus:outline-none focus:border-mustard transition-all appearance-none cursor-pointer"
              >
                <option value="Proyecto">Proyecto</option>
                <option value="Compra">Compra-Venta</option>
                <option value="Mejora">Mejora</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-mustard text-[10px] font-bold uppercase tracking-widest mb-3 ml-2">Responsable / Destinatario</label>
              <input
                required
                type="text"
                value={formData.responsable}
                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                placeholder="Ej: Tu hermano, Juan Pérez..."
                className="w-full bg-black/30 border border-white/10 rounded-xl py-4 px-6 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-mustard transition-all"
              />
            </div>

            <div>
              <label className="block text-mustard text-[10px] font-bold uppercase tracking-widest mb-3 ml-2">Fecha Estimada de Retorno</label>
              <input
                type="date"
                value={formData.fechaEstimadaRetorno}
                onChange={(e) => setFormData({ ...formData, fechaEstimadaRetorno: e.target.value })}
                className="w-full bg-black/30 border border-white/10 rounded-xl py-4 px-6 text-white text-sm focus:outline-none focus:border-mustard transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-mustard text-[10px] font-bold uppercase tracking-widest mb-3 ml-2">Notas Adicionales (Opcional)</label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Detalles adicionales sobre esta inversión..."
                rows={3}
                className="w-full bg-black/30 border border-white/10 rounded-xl py-4 px-6 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-mustard transition-all resize-none"
              />
            </div>

            <div className="sm:col-span-2 flex gap-4">
              <button 
                type="submit"
                className="flex-1 liquid-btn bg-mustard text-forest-green font-bold py-5 rounded-xl shadow-xl flex items-center justify-center gap-3 hover:shadow-mustard/30 transition-all text-base uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-xl">verified</span>
                Registrar Salida de Inversión
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="px-8 py-5 rounded-xl bg-white/5 text-white/50 hover:bg-white/10 transition-all font-bold text-sm uppercase"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Inversiones Activas */}
      <div className="glass rounded-2xl md:rounded-[32px] p-6 sm:p-10 shadow-glass-panel border border-white/10">
        <div className="flex justify-between items-center mb-8 px-4">
          <h3 className="text-white/50 text-[11px] uppercase font-bold tracking-[0.4em]">Inversiones Activas</h3>
          <div className="bg-mustard/20 text-mustard px-4 py-2 rounded-full text-xs font-bold">
            {activeInversiones.length} activa{activeInversiones.length !== 1 ? 's' : ''}
          </div>
        </div>

        {activeInversiones.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-white/20">trending_up</span>
            </div>
            <p className="text-white/20 italic font-serif text-xl">No hay inversiones activas</p>
            <p className="text-white/10 text-xs mt-2">Crea una nueva inversión para comenzar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeInversiones.map((inv) => {
              const diasTranscurridos = Math.floor(
                (new Date().getTime() - new Date(inv.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)
              );
              
              return (
                <div 
                  key={inv.id} 
                  className="glass-card rounded-xl p-6 border border-white/10 hover:border-mustard/30 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-mustard/20 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-mustard text-2xl">savings</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-lg mb-1">{inv.descripcion}</h4>
                          <div className="flex flex-wrap gap-3 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">person</span>
                              {inv.responsable}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">label</span>
                              {inv.tipo}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              {diasTranscurridos} día{diasTranscurridos !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
                        <div>
                          <p className="text-white/40 text-[9px] uppercase font-bold tracking-widest mb-1">Monto Invertido</p>
                          <p className="text-mustard font-serif font-bold text-2xl italic">${inv.monto.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[9px] uppercase font-bold tracking-widest mb-1">Retorno Estimado</p>
                          <p className="text-white/60 text-sm">
                            {inv.fechaEstimadaRetorno 
                              ? new Date(inv.fechaEstimadaRetorno).toLocaleDateString('es-MX')
                              : 'No especificado'}
                          </p>
                        </div>
                      </div>

                      {inv.notas && (
                        <div className="mt-4 p-3 bg-white/5 rounded-lg">
                          <p className="text-white/60 text-xs italic">{inv.notas}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col gap-2 sm:justify-center">
                      <button 
                        onClick={() => handleReturnClick(inv)}
                        className="flex-1 sm:flex-none liquid-btn bg-mustard text-forest-green font-bold px-6 py-4 rounded-xl flex flex-col items-center gap-1 hover:scale-105 transition-all shadow-lg shadow-mustard/20"
                      >
                        <span className="material-symbols-outlined text-2xl">keyboard_return</span>
                        <span className="text-[9px] uppercase tracking-widest">Registrar Devolución</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historial de Inversiones Completadas */}
      {inversiones.filter(i => i.status === InversionStatus.COMPLETADA).length > 0 && (
        <div className="glass rounded-2xl md:rounded-[32px] p-6 sm:p-10 shadow-glass-panel border border-white/10">
          <h3 className="text-white/50 text-[11px] uppercase font-bold tracking-[0.4em] mb-6 px-4">Historial de Inversiones Completadas</h3>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-4 text-mustard text-[9px] uppercase font-bold tracking-widest">Descripción</th>
                  <th className="py-4 px-4 text-mustard text-[9px] uppercase font-bold tracking-widest">Invertido</th>
                  <th className="py-4 px-4 text-mustard text-[9px] uppercase font-bold tracking-widest">Retornado</th>
                  <th className="py-4 px-4 text-mustard text-[9px] uppercase font-bold tracking-widest">Ganancia</th>
                  <th className="py-4 px-4 text-mustard text-[9px] uppercase font-bold tracking-widest">Fechas</th>
                </tr>
              </thead>
              <tbody className="text-white divide-y divide-white/5">
                {inversiones
                  .filter(i => i.status === InversionStatus.COMPLETADA)
                  .map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/5 transition-all">
                      <td className="py-4 px-4">
                        <p className="font-medium">{inv.descripcion}</p>
                        <p className="text-[9px] text-white/30 uppercase mt-1">{inv.responsable}</p>
                      </td>
                      <td className="py-4 px-4 font-serif italic text-white/60">${inv.monto.toLocaleString()}</td>
                      <td className="py-4 px-4 font-serif italic text-green-400 font-bold">${inv.montoRetornado?.toLocaleString() || '0'}</td>
                      <td className="py-4 px-4">
                        <span className={`font-serif italic font-bold ${(inv.ganancia || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {(inv.ganancia || 0) >= 0 ? '+' : ''}{inv.ganancia?.toLocaleString() || '0'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-white/40">
                        <p>{new Date(inv.fechaInicio).toLocaleDateString('es-MX')}</p>
                        <p className="text-[9px]">→ {inv.fechaRetornoReal ? new Date(inv.fechaRetornoReal).toLocaleDateString('es-MX') : 'N/A'}</p>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentManager;
