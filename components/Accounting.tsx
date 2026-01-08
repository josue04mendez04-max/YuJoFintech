import React, { useState, useEffect } from 'react';
import { Inversion, InversionStatus } from '../types';
import { setInversion, updateInversion, deleteInversion, listenToInversiones } from '../firestore.service';

interface AccountingProps {
  onInversionChange?: (inversiones: Inversion[]) => void;
}

const Accounting: React.FC<AccountingProps> = ({ onInversionChange }) => {
  const [inversiones, setInversionesState] = useState<Inversion[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Formulario de nueva inversión
  const [formData, setFormData] = useState({
    monto: '',
    descripcion: '',
    tipo: 'Proyecto' as 'Proyecto' | 'Compra' | 'Mejora' | 'Otro',
    responsable: 'Josué M.',
    fechaEstimadaRetorno: '',
    notas: ''
  });

  // Escuchar cambios en tiempo real desde Firebase
  useEffect(() => {
    const unsubscribe = listenToInversiones((updatedInversiones) => {
      setInversionesState(updatedInversiones);
      if (onInversionChange) {
        onInversionChange(updatedInversiones);
      }
    });

    return () => unsubscribe();
  }, [onInversionChange]);

  // Manejar cambio en inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monto' ? value : value
    }));
  };

  // Agregar o actualizar inversión
  const handleAddInversion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.monto || !formData.descripcion) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      const newInversion: Inversion = {
        id: `inv_${Date.now()}`,
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        responsable: formData.responsable,
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaEstimadaRetorno: formData.fechaEstimadaRetorno || undefined,
        status: InversionStatus.ACTIVA,
        notas: formData.notas || undefined
      };

      // Guardar en Firebase (actualización en tiempo real)
      await setInversion(newInversion);
      
      // Limpiar formulario
      setFormData({
        monto: '',
        descripcion: '',
        tipo: 'Proyecto',
        responsable: 'Josué M.',
        fechaEstimadaRetorno: '',
        notas: ''
      });
    } catch (error) {
      console.error('Error al agregar inversión:', error);
      alert('Error al guardar inversión');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado de inversión
  const handleUpdateStatus = async (id: string, newStatus: InversionStatus) => {
    try {
      await updateInversion(id, { status: newStatus });
    } catch (error) {
      console.error('Error al actualizar inversión:', error);
      alert('Error al actualizar inversión');
    }
  };

  // Eliminar inversión
  const handleDeleteInversion = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta inversión?')) return;
    
    try {
      setLoading(true);
      await deleteInversion(id);
    } catch (error) {
      console.error('Error al eliminar inversión:', error);
      alert('Error al eliminar inversión');
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales
  const totalCongelado = inversiones
    .filter(i => i.status === InversionStatus.ACTIVA || i.status === InversionStatus.PENDIENTE_RETORNO)
    .reduce((sum, i) => sum + i.monto, 0);

  const totalCompletado = inversiones
    .filter(i => i.status === InversionStatus.COMPLETADA)
    .reduce((sum, i) => sum + i.monto, 0);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Resumen de Inversiones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Total Congelado */}
        <div className="glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-5 sm:p-8 md:p-10 text-white shadow-glass-panel border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10">
          <p className="text-cyan-300/70 font-bold uppercase tracking-[0.3em] text-[8px] sm:text-[9px] mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">ac_unit</span>
            Dinero Congelado
          </p>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold italic text-cyan-200">
            ${totalCongelado.toLocaleString()}
          </h3>
          <p className="text-cyan-300/50 text-[8px] sm:text-[9px] mt-2">
            {inversiones.filter(i => i.status === InversionStatus.ACTIVA || i.status === InversionStatus.PENDIENTE_RETORNO).length} inversiones activas
          </p>
        </div>

        {/* Total Completado */}
        <div className="glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-5 sm:p-8 md:p-10 text-white shadow-glass-panel border border-green-400/30 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10">
          <p className="text-green-300/70 font-bold uppercase tracking-[0.3em] text-[8px] sm:text-[9px] mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            Dinero Retornado
          </p>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold italic text-green-200">
            ${totalCompletado.toLocaleString()}
          </h3>
          <p className="text-green-300/50 text-[8px] sm:text-[9px] mt-2">
            {inversiones.filter(i => i.status === InversionStatus.COMPLETADA).length} inversiones completadas
          </p>
        </div>

        {/* Total General */}
        <div className="glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-5 sm:p-8 md:p-10 text-white shadow-glass-panel border-t border-white/20">
          <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[8px] sm:text-[9px] mb-2">
            Total Invertido
          </p>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold italic text-mustard">
            ${(totalCongelado + totalCompletado).toLocaleString()}
          </h3>
          <p className="text-white/40 text-[8px] sm:text-[9px] mt-2">
            {inversiones.length} inversiones registradas
          </p>
        </div>
      </div>

      {/* Formulario de Nueva Inversión */}
      <div className="glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-6 sm:p-8 md:p-10 text-white shadow-glass-panel border-t border-white/20">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl">add_circle</span>
          Nueva Inversión
        </h3>

        <form onSubmit={handleAddInversion} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Monto */}
            <div>
              <label className="block text-white/70 text-sm font-bold uppercase tracking-[0.2em] mb-2">
                Monto ($) *
              </label>
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-mustard focus:bg-white/20"
                placeholder="0.00"
                required
              />
            </div>

            {/* Tipo de Inversión */}
            <div>
              <label className="block text-white/70 text-sm font-bold uppercase tracking-[0.2em] mb-2">
                Tipo *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-mustard focus:bg-white/20"
              >
                <option value="Proyecto">Proyecto</option>
                <option value="Compra">Compra</option>
                <option value="Mejora">Mejora</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-bold uppercase tracking-[0.2em] mb-2">
              Descripción *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-mustard focus:bg-white/20 min-h-24"
              placeholder="Detalle de la inversión..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Fecha Estimada de Retorno */}
            <div>
              <label className="block text-white/70 text-sm font-bold uppercase tracking-[0.2em] mb-2">
                Fecha Estimada de Retorno
              </label>
              <input
                type="date"
                name="fechaEstimadaRetorno"
                value={formData.fechaEstimadaRetorno}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-mustard focus:bg-white/20"
              />
            </div>

            {/* Responsable */}
            <div>
              <label className="block text-white/70 text-sm font-bold uppercase tracking-[0.2em] mb-2">
                Responsable
              </label>
              <input
                type="text"
                name="responsable"
                value={formData.responsable}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-mustard focus:bg-white/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-bold uppercase tracking-[0.2em] mb-2">
              Notas Adicionales
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-mustard focus:bg-white/20 min-h-20"
              placeholder="Notas opcionales..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full liquid-btn text-forest-green font-bold py-3 md:py-4 rounded-lg md:rounded-2xl uppercase tracking-[0.2em] hover:scale-[1.02] disabled:opacity-50"
          >
            <span className="material-symbols-outlined inline mr-2">save</span>
            {loading ? 'Guardando...' : 'Guardar Inversión'}
          </button>
        </form>
      </div>

      {/* Lista de Inversiones */}
      <div className="glass rounded-xl sm:rounded-2xl md:rounded-[32px] p-6 sm:p-8 md:p-10 text-white shadow-glass-panel border-t border-white/20">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl">list</span>
          Historial de Inversiones
        </h3>

        {inversiones.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40 text-sm">No hay inversiones registradas</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {inversiones.map((inversion) => (
              <div
                key={inversion.id}
                className={`rounded-lg md:rounded-xl p-4 md:p-5 border backdrop-blur-sm transition-all ${
                  inversion.status === InversionStatus.ACTIVA
                    ? 'border-cyan-400/30 bg-cyan-500/10'
                    : inversion.status === InversionStatus.PENDIENTE_RETORNO
                    ? 'border-yellow-400/30 bg-yellow-500/10'
                    : 'border-green-400/30 bg-green-500/10'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg md:text-xl font-bold">${inversion.monto.toLocaleString()}</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        inversion.status === InversionStatus.ACTIVA
                          ? 'bg-cyan-500/30 text-cyan-200'
                          : inversion.status === InversionStatus.PENDIENTE_RETORNO
                          ? 'bg-yellow-500/30 text-yellow-200'
                          : 'bg-green-500/30 text-green-200'
                      }`}>
                        {inversion.status === InversionStatus.ACTIVA ? 'Congelado' : inversion.status === InversionStatus.PENDIENTE_RETORNO ? 'Por Retornar' : 'Completado'}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm mb-1">{inversion.descripcion}</p>
                    <div className="text-xs text-white/50 space-y-1">
                      <div className="flex justify-between">
                        <span>Tipo: {inversion.tipo}</span>
                        <span>Responsable: {inversion.responsable}</span>
                      </div>
                      {inversion.fechaEstimadaRetorno && (
                        <div>Retorno Estimado: {inversion.fechaEstimadaRetorno}</div>
                      )}
                      {inversion.notas && (
                        <div className="mt-2 p-2 bg-white/5 rounded text-white/60">
                          <strong>Notas:</strong> {inversion.notas}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 md:flex-col">
                    {inversion.status !== InversionStatus.COMPLETADA && (
                      <button
                        onClick={() => handleUpdateStatus(
                          inversion.id,
                          inversion.status === InversionStatus.ACTIVA ? InversionStatus.PENDIENTE_RETORNO : InversionStatus.COMPLETADA
                        )}
                        className="flex-1 md:flex-none bg-green-500/20 hover:bg-green-500/40 text-green-200 px-3 md:px-4 py-2 rounded text-xs font-bold uppercase tracking-[0.2em] transition-colors"
                      >
                        {inversion.status === InversionStatus.ACTIVA ? 'Por Retornar' : 'Completar'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteInversion(inversion.id)}
                      disabled={loading}
                      className="flex-1 md:flex-none bg-red-500/20 hover:bg-red-500/40 text-red-200 px-3 md:px-4 py-2 rounded text-xs font-bold uppercase tracking-[0.2em] transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Accounting;
