
import React from 'react';
import { Movement } from '../types';

interface ReceiptProps {
  movement: Movement;
}

const Receipt: React.FC<ReceiptProps> = ({ movement }) => {
  return (
    <div className="p-16 bg-white text-forest-green max-w-2xl mx-auto font-sans h-[792px] w-[612px] flex flex-col border-[4px] border-forest-green/5 shadow-inner">
      {/* Header Notarial */}
      <div className="flex justify-between items-start mb-16 border-b-2 border-forest-green pb-10">
        <div>
          <h1 className="text-4xl font-serif font-bold italic tracking-tight mb-2 text-forest-green">YuJo<span className="font-light text-gray-300">Fintech</span></h1>
          <p className="text-[11px] uppercase tracking-[0.7em] text-gray-400 font-bold">Resguardo de Capital Privado</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300 mb-1">Folio Único</p>
          <p className="text-3xl font-mono text-forest-green font-bold tracking-tighter">{movement.id}</p>
        </div>
      </div>

      {/* Datos Operativos */}
      <div className="grid grid-cols-2 gap-y-12 gap-x-16 mb-20">
        <div className="border-b border-gray-100 pb-2">
          <p className="text-[10px] uppercase font-bold text-gray-300 mb-2 tracking-widest">Fecha de Registro</p>
          <p className="text-base font-semibold">{movement.date}</p>
        </div>
        <div className="border-b border-gray-100 pb-2">
          <p className="text-[10px] uppercase font-bold text-gray-300 mb-2 tracking-widest">Naturaleza del Fondo</p>
          <p className="text-base font-bold uppercase text-forest-green">{movement.type}</p>
        </div>
        <div className="border-b border-gray-100 pb-2">
          <p className="text-[10px] uppercase font-bold text-gray-300 mb-2 tracking-widest">Titular Responsable</p>
          <p className="text-base font-semibold uppercase">{movement.responsible}</p>
        </div>
        <div className="border-b border-gray-100 pb-2">
          <p className="text-[10px] uppercase font-bold text-gray-300 mb-2 tracking-widest">Autorización Superior</p>
          <p className="text-base font-bold text-forest-green italic">{movement.authorization}</p>
        </div>
      </div>

      {/* Glosa y Monto */}
      <div className="bg-gray-50/50 p-12 rounded-[40px] mb-20 border border-gray-100 flex-1 flex flex-col justify-center text-center shadow-sm">
        <p className="text-[10px] uppercase font-bold text-gray-300 mb-8 tracking-[0.5em]">Protocolo de Transacción</p>
        <p className="text-gray-700 font-serif italic text-2xl leading-relaxed mb-12 px-8">"{movement.description}"</p>
        <div className="pt-12 border-t-2 border-dashed border-gray-200">
          <p className="text-[10px] text-gray-300 uppercase font-bold mb-4 tracking-widest">Total Sometido a Gestión</p>
          <p className="text-7xl font-serif font-bold italic text-forest-green">
            ${movement.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Firmas Físicas Manuales */}
      <div className="grid grid-cols-2 gap-24 mt-auto pb-10">
        <div className="text-center">
          <div className="h-24 flex items-end justify-center mb-5 border-b-2 border-forest-green/20"></div>
          <p className="text-[12px] uppercase font-bold text-forest-green tracking-[0.2em]">Firma del Titular</p>
          <p className="text-[9px] text-gray-400 mt-2 italic uppercase tracking-tighter">({movement.responsible})</p>
        </div>
        <div className="text-center">
          <div className="h-24 flex items-end justify-center mb-5 border-b-2 border-forest-green/20"></div>
          <p className="text-[12px] uppercase font-bold text-forest-green tracking-[0.2em]">Firma de Autorización</p>
          <p className="text-[9px] text-gray-400 mt-2 italic uppercase tracking-tighter">Josué M. • YuJoFintech</p>
        </div>
      </div>

      <div className="mt-16 text-center opacity-40 border-t border-gray-100 pt-8">
        <p className="text-[9px] text-gray-400 italic tracking-[0.7em] uppercase">Documento Privado • Sistema de Gestión Patrimonial YuJo • No Endosable</p>
      </div>
    </div>
  );
};

export default Receipt;
