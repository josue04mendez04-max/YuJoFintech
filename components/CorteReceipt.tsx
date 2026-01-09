
import React, { useState } from 'react';
import { CorteSummary } from '../types';

interface CorteReceiptProps {
  summary: CorteSummary;
}

const CorteReceipt: React.FC<CorteReceiptProps> = ({ summary }) => {
  const [editingAuth1, setEditingAuth1] = useState(false);
  const [editingAuth2, setEditingAuth2] = useState(false);
  const [auth1Name, setAuth1Name] = useState('');
  const [auth2Name, setAuth2Name] = useState('');

  // Componente individual del recibo de corte
  const CorteReceiptCard = () => (
    <div className="bg-white text-forest-green font-sans flex flex-col border border-forest-green/20 p-5 h-full">
      <div className="text-center mb-4">
        <h1 className="text-xl font-serif font-bold italic tracking-tight mb-1">YuJo<span className="font-light text-gray-400">Fintech</span></h1>
        <p className="text-[7px] uppercase tracking-[0.3em] text-forest-green font-bold">Certificado de Cierre</p>
      </div>

      <div className="flex justify-between items-end mb-4 border-b-2 border-forest-green pb-2">
        <div>
           <p className="text-[7px] uppercase font-bold text-gray-400 mb-1">Folio</p>
           <p className="text-xl font-mono font-bold">{summary.id}</p>
        </div>
        <div className="text-right">
           <p className="text-[7px] uppercase font-bold text-gray-400 mb-1">Fecha</p>
           <p className="text-sm font-bold italic">{summary.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-[7px]">
         <div className="p-2 bg-green-50 rounded text-center">
            <p className="uppercase font-bold text-green-600 mb-1">Ingresos</p>
            <p className="text-xs font-serif italic text-green-700 font-bold">${summary.ingresosTotal.toLocaleString()}</p>
         </div>
         <div className="p-2 bg-red-50 rounded text-center">
            <p className="uppercase font-bold text-red-600 mb-1">Egresos</p>
            <p className="text-xs font-serif italic text-red-700 font-bold">-${summary.egresosTotal.toLocaleString()}</p>
         </div>
         <div className="p-2 bg-amber-50 rounded text-center">
            <p className="uppercase font-bold text-amber-600 mb-1">Inversiones</p>
            <p className="text-xs font-serif italic text-amber-700 font-bold">-${summary.inversionesRealizadas.toLocaleString()}</p>
         </div>
      </div>

      <div className="border-2 border-forest-green p-3 rounded mb-3 bg-forest-green/5 text-[7px]">
         <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
               <p className="uppercase font-bold text-gray-400 mb-1">Balance Calculado</p>
               <p className="text-lg font-serif font-bold italic">${summary.balanceCalculado.toLocaleString()}</p>
            </div>
            <div className="text-right">
               <p className="uppercase font-bold text-gray-400 mb-1">Conteo Físico</p>
               <p className="text-lg font-serif font-bold italic">${summary.conteoFisico.toLocaleString()}</p>
            </div>
         </div>
         <div className="border-t-2 border-forest-green pt-2">
            <p className={`text-center font-bold text-xs ${Math.abs(summary.diferencia) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
               {Math.abs(summary.diferencia) < 0.01 ? '✓ CUADRE' : '⚠ DIFERENCIA'}: ${summary.diferencia.toLocaleString()}
            </p>
         </div>
      </div>

      {/* Patrimonio */}
      <div className="bg-gray-50 border border-gray-200 p-2 rounded mb-3 text-[7px]">
         <p className="uppercase font-bold text-gray-600 mb-2 border-b border-gray-200 pb-1">Posición de Activos</p>
         <div className="grid grid-cols-3 gap-1 text-[6px]">
            <div>
               <span className="text-gray-500">Efectivo:</span>
               <p className="font-bold">${summary.patrimonio.efectivoDisponible.toLocaleString()}</p>
            </div>
            <div>
               <span className="text-gray-500">Inversiones:</span>
               <p className="font-bold">${summary.patrimonio.inversionesActivas.toLocaleString()}</p>
            </div>
            <div>
               <span className="text-gray-500 font-bold">Capital Total:</span>
               <p className="font-bold text-forest-green">${summary.patrimonio.capitalTotal.toLocaleString()}</p>
            </div>
         </div>
      </div>

      {/* Ajuste si existe */}
      {summary.ajuste && (
         <div className={`border-2 p-2 rounded mb-3 text-[7px] ${
            summary.ajuste.tipo === 'SOBRANTE' 
               ? 'border-yellow-500 bg-yellow-50' 
               : 'border-red-500 bg-red-50'
         }`}>
            <p className={`font-bold uppercase ${
               summary.ajuste.tipo === 'SOBRANTE' 
                  ? 'text-yellow-700' 
                  : 'text-red-700'
            }`}>
               {summary.ajuste.tipo}: ${summary.ajuste.monto.toLocaleString()}
            </p>
            <p className="text-gray-600 mt-1">{summary.ajuste.descripcion}</p>
         </div>
      )}

      <div className="mb-3 flex-1">
         <p className="text-[7px] uppercase font-bold text-gray-400 mb-2 border-b border-gray-100 pb-1">Folios ({summary.movements.length})</p>
         <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[6px] font-mono overflow-y-auto max-h-32">
            {summary.movements.map(m => (
              <div key={m.id} className="flex justify-between border-b border-gray-50 py-0.5">
                 <span className="text-gray-400">{m.id}</span>
                 <span className="font-bold text-forest-green">{m.type.slice(0,3)}: ${m.amount.toLocaleString()}</span>
              </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto">
        <div className="text-center">
          <div className="h-10 border-b border-forest-green mb-2"></div>
          <p className="text-[7px] uppercase font-bold text-forest-green mb-1">Firma</p>
          <p className="text-[6px] uppercase font-semibold text-gray-400 tracking-tight">{auth1Name || '_______________'}</p>
        </div>
        <div className="text-center">
          <div className="h-10 border-b border-forest-green mb-2"></div>
          <p className="text-[7px] uppercase font-bold text-forest-green mb-1">Firma</p>
          <p className="text-[6px] uppercase font-semibold text-gray-400 tracking-tight">{auth2Name || '_______________'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white w-[1122px] max-w-full h-auto sm:h-[792px] flex flex-col p-3 sm:p-6 gap-4 sm:gap-6 mx-auto overflow-y-auto sm:overflow-visible">
      {/* Dos recibos de corte en horizontal */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 h-auto sm:h-full">
        <div className="flex-1 min-h-[500px] sm:min-h-0">
          <CorteReceiptCard />
        </div>
        <div className="w-px bg-gray-200 hidden sm:block"></div>
        <div className="flex-1 min-h-[500px] sm:min-h-0 hidden sm:block">
          <CorteReceiptCard />
        </div>
      </div>

      {/* Editor de autorizaciones solo visible en pantalla */}
      <div className="hidden print:hidden fixed bottom-4 right-4 bg-white p-3 sm:p-4 rounded-lg shadow-lg z-50 border border-forest-green space-y-2 sm:space-y-3 text-xs sm:text-sm">
        <div>
          <label className="block text-forest-green text-[10px] sm:text-xs font-bold mb-1 sm:mb-2">Autoriza 1:</label>
          <input
            type="text"
            value={auth1Name}
            onChange={(e) => setAuth1Name(e.target.value)}
            placeholder="Nombre"
            className="w-full border border-forest-green rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-forest-green text-[10px] sm:text-xs font-bold mb-1 sm:mb-2">Autoriza 2:</label>
          <input
            type="text"
            value={auth2Name}
            onChange={(e) => setAuth2Name(e.target.value)}
            placeholder="Nombre"
            className="w-full border border-forest-green rounded px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default CorteReceipt;
