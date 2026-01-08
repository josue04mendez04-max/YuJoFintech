
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Movement, MovementType, MovementStatus, VaultCount, CorteSummary } from './types';
import Dashboard from './components/Dashboard';
import Registry from './components/Registry';
import Vault from './components/Vault';
import CorteDeCaja from './components/CorteDeCaja';
import Sidebar from './components/Sidebar';
import PinPad from './components/PinPad';
import Receipt from './components/Receipt';
import CorteReceipt from './components/CorteReceipt';
import * as FirestoreService from './firestore.service';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'notaria' | 'contabilidad' | 'corte'>('dashboard');
  
  // Estado de movimientos
  const [movements, setMovements] = useState<Movement[]>([]);
  
  // Saldo inicial para el corte actual (se obtiene del último corte)
  const [saldoInicial, setSaldoInicial] = useState<number>(0);
  
  const [vault, setVault] = useState<VaultCount>({
    bills: { '1000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0 },
    coins: { '10': 0, '5': 0, '2': 0, '1': 0, '0.5': 0 }
  });
  
  const [showPinPad, setShowPinPad] = useState(false);
  const [pinCallback, setPinCallback] = useState<(() => void) | null>(null);
  const [securityMsg, setSecurityMsg] = useState('');
  const [selectedMovementForPrint, setSelectedMovementForPrint] = useState<Movement | null>(null);
  const [selectedCorteForPrint, setSelectedCorteForPrint] = useState<CorteSummary | null>(null);
  
  // Estados de Sincronización
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('syncing');
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  // Función de carga de datos optimizada
  const fetchMovements = useCallback(async () => {
    setIsLoading(true);
    setSyncStatus('syncing');
    setLastSyncError(null);

    try {
      const data = await FirestoreService.fetchMovements();
      setMovements(data);
      
      // Obtener el último corte para el saldo inicial
      const lastCorte = await FirestoreService.getLastCorte();
      if (lastCorte) {
        // El saldo inicial del próximo corte es el conteo físico del último corte
        setSaldoInicial(lastCorte.conteoFisico);
      }
      
      setSyncStatus('synced');
      console.log("YuJo: Sincronización exitosa con Firebase Firestore.");
    } catch (err: any) {
      console.error(`YuJo Sync Error:`, err);
      setLastSyncError(err.message || "Error al conectar con Firebase Firestore");
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sincronización al iniciar
  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const physicalTotal = useMemo(() => {
    let t = 0;
    Object.entries(vault.bills).forEach(([d, c]) => t += Number(d) * Number(c || 0));
    Object.entries(vault.coins).forEach(([d, c]) => t += Number(d) * Number(c || 0));
    return t;
  }, [vault]);

  const addMovement = async (m: Movement) => {
    // 1. Actualización optimista local
    setMovements(prev => [...prev, m]);

    // 2. Persistencia en Firebase Firestore
    try {
      setSyncStatus('syncing');
      await FirestoreService.addMovement(m);
      setSyncStatus('synced');
      console.log("YuJo: Registro enviado a Firebase satisfactoriamente.");
    } catch (error) {
      console.error("Error al enviar movimiento a Firebase:", error);
      setSyncStatus('error');
      // Revertir cambio local en caso de error
      setMovements(prev => prev.filter(mov => mov.id !== m.id));
    }
  };

  const handleSecurityAction = (msg: string, callback: () => void) => {
    setSecurityMsg(msg);
    setPinCallback(() => callback);
    setShowPinPad(true);
  };

  const deleteMovement = (id: string) => {
    handleSecurityAction("Josué, ¿estás seguro de eliminar este registro?", async () => {
      setMovements(prev => prev.filter(m => m.id !== id));
      
      try {
        await FirestoreService.deleteMovement(id);
      } catch (err) {
        console.error("Error eliminando en Firebase", err);
      }
    });
  };

  const editMovement = (id: string) => {
    handleSecurityAction("Josué, ¿estás seguro de modificar este registro? Necesito tu PIN maestro.", () => {
      alert("Modo edición autorizado para el folio " + id);
    });
  };

  const handleReturnInvestment = async (m: Movement) => {
    const amountStr = prompt(`Retorno de inversión: ${m.description}\nJosué, ingresa el monto total recibido:`, m.amount.toString());
    if (amountStr && !isNaN(parseFloat(amountStr))) {
      const amount = parseFloat(amountStr);
      const returnMovement: Movement = {
        id: `RET-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        type: MovementType.INGRESO,
        category: 'Inversión Retornada',
        amount: amount,
        description: `RETORNO: ${m.description}`,
        responsible: "Sistema / Retorno",
        authorization: 'Josué M.',
        date: new Date().toISOString().split('T')[0],
        status: MovementStatus.PENDIENTE_CORTE
      };
      
      const updated = movements.map(item => item.id === m.id ? { ...item, status: MovementStatus.ARCHIVADO } : item)
        .concat(returnMovement);
      
      setMovements(updated);
      
      try {
        await FirestoreService.addMovement(returnMovement);
        await FirestoreService.updateMovementStatus(m.id, MovementStatus.ARCHIVADO);
      } catch (err) { 
        console.error("Fallo al registrar retorno en Firebase", err);
      }

      alert("Inversión retornada con éxito.");
    }
  };

  const performCorte = () => {
    const active = movements.filter(m => m.status === MovementStatus.PENDIENTE_CORTE);
    const ingresos = active.filter(m => m.type === MovementType.INGRESO).reduce((a, b) => a + b.amount, 0);
    const gastos = active.filter(m => m.type === MovementType.GASTO).reduce((a, b) => a + b.amount, 0);
    const inversiones = active.filter(m => m.type === MovementType.INVERSION).reduce((a, b) => a + b.amount, 0);
    
    // Fórmula correcta: Saldo_Final = Saldo_Inicial + Ingresos - Gastos - Inversiones
    const balanceSistema = saldoInicial + ingresos - gastos - inversiones;
    const diferencia = physicalTotal - balanceSistema;
    
    // Si hay diferencia, preguntar por el ajuste
    let ajuste: number | undefined = undefined;
    if (Math.abs(diferencia) >= 0.01) {
      const confirmMsg = 
        `⚠️ DIFERENCIA DETECTADA\n\n` +
        `Conteo Físico: $${physicalTotal.toFixed(2)}\n` +
        `Balance Sistema: $${balanceSistema.toFixed(2)}\n` +
        `Diferencia: ${diferencia > 0 ? '+' : ''}$${diferencia.toFixed(2)} (${diferencia > 0 ? 'Sobrante' : 'Faltante'})\n\n` +
        `Para cuadrar la contabilidad, se debe crear un Asiento de Ajuste.\n` +
        `¿Confirmas registrar este ajuste?\n\n` +
        `Escribe "SI" para confirmar o "NO" para cancelar:`;
      
      const ajusteResponse = prompt(confirmMsg, 'SI');
      
      if (!ajusteResponse || ajusteResponse.trim().toUpperCase() !== 'SI') {
        alert('⛔ Corte cancelado.\nPor favor revisa el conteo físico o los movimientos antes de continuar.');
        return;
      }
      ajuste = diferencia;
    }
    
    const summary: CorteSummary = {
      id: `CORTE-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString(),
      fechaInicio: active.length > 0 ? active[active.length - 1].date : new Date().toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0],
      saldoInicial: saldoInicial,
      ingresosTotal: ingresos,
      gastosTotal: gastos,
      inversionesTotal: inversiones,
      desinversionesTotal: 0, // Por ahora, se calculará en futuros retornos
      balanceSistema: balanceSistema,
      conteoFisico: physicalTotal,
      diferencia: diferencia,
      ajuste: ajuste,
      movements: active
    };

    handleSecurityAction("Josué, ¿confirmas el cierre definitivo de este ciclo?", async () => {
      setSelectedCorteForPrint(summary);
      
      const idsToArchive = active.map(m => m.id);

      // Actualizamos localmente
      setMovements(prev => prev.map(m => 
        idsToArchive.includes(m.id) 
           ? { ...m, status: MovementStatus.ARCHIVADO, cutId: summary.id } 
           : m
      ));
      
      // El nuevo saldo inicial será el conteo físico de este corte
      setSaldoInicial(physicalTotal);
      
      // Enviamos a Firebase Firestore
      try {
        await FirestoreService.performCorte(idsToArchive, summary.id);
        await FirestoreService.saveCorte(summary);
        console.log("YuJo: Corte guardado exitosamente en Firebase.");
      } catch (err) { 
        console.error("Error al registrar corte en Firebase", err);
      }

      setTimeout(() => {
        window.print();
        setSelectedCorteForPrint(null);
        setView('dashboard');
      }, 500);
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar currentView={view} setView={setView} />
      
      <main className="flex-1 p-4 sm:p-8 md:p-10 overflow-y-auto no-print custom-scrollbar">
        <header className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-forest-green/10 pb-6 sm:pb-8 gap-6 sm:gap-0">
          <div className="max-w-full sm:max-w-3xl pt-8 sm:pt-0">
            <div className="flex flex-col gap-2 sm:gap-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-1">
                <p className="text-mustard font-bold tracking-[0.4em] text-[8px] sm:text-[10px] uppercase">YuJo • Financial Concierge</p>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[7px] sm:text-[8px] font-bold uppercase tracking-widest ${
                  syncStatus === 'synced' ? 'bg-green-500/10 text-green-500' : 
                  syncStatus === 'syncing' ? 'bg-mustard/10 text-mustard animate-pulse' : 
                  'bg-red-500/10 text-red-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    syncStatus === 'synced' ? 'bg-green-500' : 
                    syncStatus === 'syncing' ? 'bg-mustard' : 
                    'bg-red-500'
                  }`}></span>
                  {syncStatus === 'synced' ? 'Cloud OK' : syncStatus === 'syncing' ? 'Sync...' : 'Error'}
                </div>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold italic text-forest-green mb-2 sm:mb-3">
                {view === 'dashboard' && 'El Atrio'}
                {view === 'notaria' && 'La Notaría'}
                {view === 'contabilidad' && 'La Bóveda'}
                {view === 'corte' && 'Corte de Caja'}
              </h1>
              <p className="text-forest-green/70 text-xs sm:text-sm font-medium italic max-w-lg">
                "Hola Josué. {syncStatus === 'error' ? 'Modo local activo.' : 'Tu patrimonio está sincronizado.'}"
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl sm:rounded-3xl bg-forest-green text-bone-white flex items-center justify-center font-bold shadow-liquid border border-white/10 text-xl sm:text-2xl">J</div>
            {syncStatus === 'error' && (
              <button 
                onClick={fetchMovements}
                className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold text-mustard uppercase hover:underline"
              >
                <span className="material-symbols-outlined text-xs">sync</span>
                Reintentar
              </button>
            )}
          </div>
        </header>

        {syncStatus === 'error' && movements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-auto py-16 sm:h-64 text-center px-4">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4 shadow-inner">
               <span className="material-symbols-outlined text-3xl sm:text-4xl font-bold">cloud_off</span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold italic text-forest-green mb-2">Error de Conexión</h3>
            <p className="text-xs sm:text-sm text-forest-green/50 max-w-sm mb-6">
              {lastSyncError || "No se pudo conectar con Firebase."}
            </p>
            <button 
              onClick={fetchMovements}
              className="liquid-btn px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl text-forest-green font-bold text-xs uppercase tracking-widest"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {view === 'dashboard' && (
              <Dashboard 
                movements={movements}
                inversiones={[]}
                vault={vault}
                onOpenVault={() => setView('contabilidad')}
                onPerformCut={() => setView('corte')}
              />
            )}
            
            {view === 'notaria' && (
              <Registry 
                movements={movements}
                onSave={addMovement} 
                onEdit={editMovement}
                onDelete={deleteMovement}
                onPrint={(m) => { setSelectedMovementForPrint(m); setTimeout(() => { window.print(); setSelectedMovementForPrint(null); }, 100); }}
                onReturnInvestment={handleReturnInvestment}
              />
            )}

            {view === 'contabilidad' && (
              <Vault count={vault} setCount={setVault} />
            )}

            {view === 'corte' && (
              <CorteDeCaja 
                movements={movements}
                physicalTotal={physicalTotal}
                onConfirmCorte={performCorte}
                saldoInicial={saldoInicial}
              />
            )}
          </>
        )}
      </main>

      {showPinPad && (
        <PinPad 
          message={securityMsg}
          onSuccess={() => { pinCallback?.(); setShowPinPad(false); }} 
          onClose={() => setShowPinPad(false)} 
        />
      )}

      <div className="print-only fixed inset-0 z-[9999] bg-white">
        {selectedMovementForPrint && <Receipt movement={selectedMovementForPrint} />}
        {selectedCorteForPrint && <CorteReceipt summary={selectedCorteForPrint} />}
      </div>
    </div>
  );
};

export default App;
