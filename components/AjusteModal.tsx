import React, { useState } from 'react';

interface AjusteModalProps {
  monto: number;
  tipo: 'SOBRANTE' | 'FALTANTE';
  isOpen: boolean;
  onConfirm: (descripcion: string) => void;
  onCancel: () => void;
}

const AjusteModal: React.FC<AjusteModalProps> = ({
  monto,
  tipo,
  isOpen,
  onConfirm,
  onCancel
}) => {
  const [descripcion, setDescripcion] = useState('');
  const [razonSeleccionada, setRazonSeleccionada] = useState<string>('');

  if (!isOpen) return null;

  const razonesDefault = {
    SOBRANTE: [
      'Conteo manual incorrecto',
      'Billete/moneda sin registrar',
      'Error en sistema de punto de venta',
      'Devolución pendiente de registrar',
      'Otro'
    ],
    FALTANTE: [
      'Conteo manual incorrecto',
      'Faltante sin justificación',
      'Error administrativo',
      'Robo/Pérdida',
      'Descuadre del sistema',
      'Otro'
    ]
  };

  const handleConfirm = () => {
    const descFinal = descripcion || razonSeleccionada || `${tipo} sin descripción`;
    onConfirm(descFinal);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-lg sm:rounded-2xl w-full max-w-md border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-white text-2xl font-serif font-bold italic mb-2">Ajuste de Saldos</h2>
          <p className="text-white/60 text-sm">Se requiere un asiento de ajuste para conciliar el corte.</p>
        </div>

        {/* Información del ajuste */}
        <div className={`p-4 rounded-lg border-2 ${
          tipo === 'SOBRANTE'
            ? 'bg-yellow-500/10 border-yellow-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <p className={`text-sm font-bold uppercase mb-1 ${
            tipo === 'SOBRANTE' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {tipo === 'SOBRANTE' ? '+ SOBRANTE' : '- FALTANTE'}
          </p>
          <p className="text-white text-2xl font-serif font-bold">${monto.toLocaleString()}</p>
          <p className="text-white/60 text-xs mt-2 italic">
            {tipo === 'SOBRANTE'
              ? 'El conteo físico excede el balance calculado.'
              : 'El balance calculado excede el conteo físico.'}
          </p>
        </div>

        {/* Razones predefinidas */}
        <div>
          <label className="block text-white/60 text-sm font-bold uppercase tracking-wider mb-3">Causa Probable</label>
          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
            {razonesDefault[tipo].map((razon) => (
              <button
                key={razon}
                onClick={() => {
                  setRazonSeleccionada(razon);
                  if (razon !== 'Otro') {
                    setDescripcion('');
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-sm ${
                  razonSeleccionada === razon
                    ? 'bg-mustard/20 border-mustard/50 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                {razon}
              </button>
            ))}
          </div>
        </div>

        {/* Campo de descripción personalizada */}
        <div>
          <label className="block text-white/60 text-sm font-bold uppercase tracking-wider mb-2">
            Detalles Adicionales
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => {
              setDescripcion(e.target.value);
              setRazonSeleccionada('');
            }}
            placeholder="Describe la causa del ajuste..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 text-sm focus:border-mustard/50 outline-none transition-colors resize-none h-20"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!descripcion && !razonSeleccionada}
            className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${
              descripcion || razonSeleccionada
                ? 'bg-mustard text-forest-green hover:scale-[1.02]'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            Crear Asiento de Ajuste
          </button>
        </div>

        {/* Nota legal */}
        <div className="border-t border-white/10 pt-4">
          <p className="text-[10px] text-white/40 italic text-center">
            Este ajuste será registrado en la auditoría del corte y disponible para revisión.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AjusteModal;
