
import React from 'react';
import { Movement } from '../types';

interface ReceiptProps {
  movement: Movement;
}

const Receipt: React.FC<ReceiptProps> = ({ movement }) => {
  // Componente individual del recibo para reutilización
  const ReceiptCard = () => (
    <div className="bg-white text-forest-green font-sans flex flex-col border border-forest-green/20 p-6 h-full">
      {/* Header Notarial */}
      <div className="flex justify-between items-start mb-4 border-b border-forest-green pb-3">
        <div>
          <h1 className="text-2xl font-serif font-bold italic tracking-tight mb-1 text-forest-green">YuJo<span className="font-light text-gray-300">Fintech</span></h1>
          <p className="text-[8px] uppercase tracking-[0.5em] text-gray-400 font-bold">Resguardo Capital</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-bold uppercase tracking-widest text-gray-300 mb-1">Folio</p>
          <p className="text-lg font-mono text-forest-green font-bold tracking-tighter">{movement.id}</p>
        </div>
      </div>

      {/* Datos Operativos */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-3 mb-3 text-[7px]">
        <div className="border-b border-gray-100 pb-1">
          <p className="uppercase font-bold text-gray-300 mb-1 tracking-widest">Fecha</p>
          <p className="text-xs font-semibold">{movement.date}</p>
        </div>
        <div className="border-b border-gray-100 pb-1">
          <p className="uppercase font-bold text-gray-300 mb-1 tracking-widest">Tipo</p>
          <p className="text-xs font-bold uppercase text-forest-green">{movement.type}</p>
        </div>
        <div className="border-b border-gray-100 pb-1">
          <p className="uppercase font-bold text-gray-300 mb-1 tracking-widest">Titular</p>
          <p className="text-xs font-semibold uppercase">{movement.responsible}</p>
        </div>
        <div className="border-b border-gray-100 pb-1">
          <p className="uppercase font-bold text-gray-300 mb-1 tracking-widest">Autorización</p>
          <p className="text-xs font-bold text-forest-green italic">{movement.authorization}</p>
        </div>
      </div>

      {/* Glosa y Monto */}
      <div className="bg-gray-50/50 p-3 rounded-lg mb-3 border border-gray-100 flex-1 flex flex-col justify-center text-center shadow-sm">
        <p className="text-[7px] uppercase font-bold text-gray-300 mb-2 tracking-[0.3em]">Protocolo</p>
        <p className="text-gray-700 font-serif italic text-[10px] leading-snug mb-2 px-2">{movement.description}</p>
        <div className="pt-2 border-t border-dashed border-gray-200">
          <p className="text-[7px] text-gray-300 uppercase font-bold mb-2 tracking-widest">Total Gestión</p>
          <p className="text-2xl font-serif font-bold italic text-forest-green">
            ${movement.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Firmas Físicas Manuales */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <div className="text-center">
          <div className="h-12 flex items-end justify-center mb-1 border-b border-forest-green/20"></div>
          <p className="text-[7px] uppercase font-bold text-forest-green tracking-tight">Titular</p>
        </div>
        <div className="text-center">
          <div className="h-12 flex items-end justify-center mb-1 border-b border-forest-green/20"></div>
          <p className="text-[7px] uppercase font-bold text-forest-green tracking-tight">Autoriza</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white w-[1122px] h-[792px] flex flex-col p-6 gap-6 mx-auto">
      {/* Dos recibos en horizontal */}
      <div className="flex gap-6 h-full">
        <div className="flex-1">
          <ReceiptCard />
        </div>
        <div className="w-px bg-gray-200"></div>
        <div className="flex-1">
          <ReceiptCard />
        </div>
      </div>
    </div>
  );
};

export default Receipt;
