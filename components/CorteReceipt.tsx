
import React from 'react';
import { CorteSummary } from '../types';

interface CorteReceiptProps {
  summary: CorteSummary;
}

const CorteReceipt: React.FC<CorteReceiptProps> = ({ summary }) => {
  return (
    <div className="p-20 bg-white text-forest-green max-w-3xl mx-auto font-sans">
      <div className="text-center mb-20">
        <h1 className="text-4xl font-serif font-bold italic tracking-tight mb-2">YuJo<span className="font-light text-gray-400">Fintech</span></h1>
        <p className="text-xs uppercase tracking-[0.4em] text-forest-green font-bold">Certificado de Cierre de Ciclo</p>
      </div>

      <div className="flex justify-between items-end mb-16 border-b-4 border-forest-green pb-10">
        <div>
           <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Folio de Cierre</p>
           <p className="text-3xl font-mono font-bold">{summary.id}</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Fecha de Ejecución</p>
           <p className="text-xl font-bold italic">{summary.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-20 text-center">
         <div className="p-6 bg-gray-50 rounded-2xl">
            <p className="text-[9px] uppercase font-bold text-gray-400 mb-2">Total Ingresos</p>
            <p className="text-2xl font-serif italic text-green-700 font-bold">${summary.ingresosTotal.toLocaleString()}</p>
         </div>
         <div className="p-6 bg-gray-50 rounded-2xl">
            <p className="text-[9px] uppercase font-bold text-gray-400 mb-2">Total Egresos</p>
            <p className="text-2xl font-serif italic text-red-700 font-bold">-${summary.gastosTotal.toLocaleString()}</p>
         </div>
         <div className="p-6 bg-forest-green text-white rounded-2xl">
            <p className="text-[9px] uppercase font-bold opacity-60 mb-2">Balance Sistema</p>
            <p className="text-2xl font-serif italic font-bold">${summary.balanceSistema.toLocaleString()}</p>
         </div>
      </div>

      <div className="border-2 border-forest-green p-10 rounded-3xl mb-16 flex justify-between items-center bg-gray-50">
         <div>
            <p className="text-xs uppercase font-bold text-gray-400 mb-1">Conteo Físico Real</p>
            <p className="text-5xl font-serif font-bold italic">${summary.conteoFisico.toLocaleString()}</p>
         </div>
         <div className="text-right">
            <p className="text-xs uppercase font-bold text-gray-400 mb-1">Diferencia Final</p>
            <p className={`text-3xl font-mono font-bold ${Math.abs(summary.diferencia) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
               ${summary.diferencia.toLocaleString()}
            </p>
         </div>
      </div>

      <div className="mb-20">
         <p className="text-[10px] uppercase font-bold text-gray-400 mb-6 border-b border-gray-100 pb-2">Folios Consolidados ({summary.movements.length})</p>
         <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-[10px] font-mono">
            {summary.movements.map(m => (
              <div key={m.id} className="flex justify-between border-b border-gray-50 py-1">
                 <span className="text-gray-400">{m.id}</span>
                 <span className="font-bold text-forest-green">{m.type.slice(0,3)}: ${m.amount.toLocaleString()}</span>
              </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-2 gap-24 mt-32 text-center">
        <div>
          <div className="h-24 border-b-2 border-forest-green mb-4"></div>
          <p className="text-[10px] uppercase font-bold text-gray-400">Certifica Josué M.</p>
          <p className="text-[8px] text-gray-300 mt-1 italic tracking-widest uppercase">Autorización Superior</p>
        </div>
        <div>
          <div className="h-24 border-b-2 border-forest-green mb-4"></div>
          <p className="text-[10px] uppercase font-bold text-gray-400">Responsable de Caja</p>
          <p className="text-[8px] text-gray-300 mt-1 italic tracking-widest uppercase">Cuadre Físico</p>
        </div>
      </div>
    </div>
  );
};

export default CorteReceipt;
