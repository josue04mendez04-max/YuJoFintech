
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
         <div className="p-2 bg-gray-50 rounded text-center">
            <p className="uppercase font-bold text-gray-400 mb-1">Ingresos</p>
            <p className="text-xs font-serif italic text-green-700 font-bold">${summary.ingresosTotal.toLocaleString()}</p>
         </div>
         <div className="p-2 bg-gray-50 rounded text-center">
            <p className="uppercase font-bold text-gray-400 mb-1">Egresos</p>
            <p className="text-xs font-serif italic text-red-700 font-bold">-${summary.gastosTotal.toLocaleString()}</p>
         </div>
         <div className="p-2 bg-forest-green text-white rounded text-center">
            <p className="uppercase font-bold opacity-60 mb-1">Balance</p>
            <p className="text-xs font-serif italic font-bold">${summary.balanceSistema.toLocaleString()}</p>
         </div>
      </div>

      <div className="border border-forest-green p-2 rounded mb-3 flex justify-between items-center bg-gray-50 text-[7px]">
         <div>
            <p className="uppercase font-bold text-gray-400 mb-1">Conteo</p>
            <p className="text-lg font-serif font-bold italic">${summary.conteoFisico.toLocaleString()}</p>
         </div>
         <div className="text-right">
            <p className="uppercase font-bold text-gray-400 mb-1">Diferencia</p>
            <p className={`text-base font-mono font-bold ${Math.abs(summary.diferencia) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
               ${summary.diferencia.toLocaleString()}
            </p>
         </div>
      </div>

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
    <div className="bg-white w-[1122px] h-[792px] flex flex-col p-6 gap-6 mx-auto">
      {/* Dos recibos de corte en horizontal */}
      <div className="flex gap-6 h-full">
        <div className="flex-1">
          <CorteReceiptCard />
        </div>
        <div className="w-px bg-gray-200"></div>
        <div className="flex-1">
          <CorteReceiptCard />
        </div>
      </div>

      {/* Editor de autorizaciones solo visible en pantalla */}
      <div className="hidden print:hidden fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 border border-forest-green space-y-3">
        <div>
          <label className="block text-forest-green text-xs font-bold mb-1">Autoriza 1:</label>
          <input
            type="text"
            value={auth1Name}
            onChange={(e) => setAuth1Name(e.target.value)}
            placeholder="Nombre"
            className="w-full border border-forest-green rounded px-2 py-1 text-xs"
          />
        </div>
        <div>
          <label className="block text-forest-green text-xs font-bold mb-1">Autoriza 2:</label>
          <input
            type="text"
            value={auth2Name}
            onChange={(e) => setAuth2Name(e.target.value)}
            placeholder="Nombre"
            className="w-full border border-forest-green rounded px-2 py-1 text-xs"
          />
        </div>
      </div>
    </div>
  );
};

export default CorteReceipt;
