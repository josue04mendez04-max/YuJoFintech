
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Movement, MovementType, MovementStatus, VaultCount, CorteSummary } from './types';
import Dashboard from './components/Dashboard';
import Registry from './components/Registry';
import Vault from './components/Vault';
import CorteDeCaja from './components/CorteDeCaja';
import CortHistory from './components/CortHistory';
import CortDetailModal from './components/CortDetailModal';
import Sidebar from './components/Sidebar';
import PinPad from './components/PinPad';
import Receipt from './components/Receipt';
import CorteReceipt from './components/CorteReceipt';
import * as FirestoreService from './firestore.service';
import * as ConciliacionService from './conciliacion.service';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'notaria' | 'contabilidad' | 'corte' | 'historialCortes'>('dashboard');
  
  // Estado de movimientos
  const [movements, setMovements] = useState<Movement[]>([]);
  
  const [vault, setVault] = useState<VaultCount>({
    bills: { '1000': 0, '500': 0, '200': 0, '100': 0, '50': 0, '20': 0 },
    coins: { '10': 0, '5': 0, '2': 0, '1': 0, '0.5': 0 }
  });
  
  const [showPinPad, setShowPinPad] = useState(false);
  const [pinCallback, setPinCallback] = useState<(() => void) | null>(null);
  const [securityMsg, setSecurityMsg] = useState('');
  const [selectedMovementForPrint, setSelectedMovementForPrint] = useState<Movement | null>(null);
  const [selectedCorteForPrint, setSelectedCorteForPrint] = useState<CorteSummary | null>(null);
  const [selectedCortDetail, setSelectedCortDetail] = useState<{ cutId: string; isOpen: boolean }>({ cutId: '', isOpen: false });
  
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
    const amountStr = prompt(`Retorno de inversión: ${m.description}\nMonto original: $${m.amount.toLocaleString()}\n\nIngresa el monto total recibido (incluyendo ganancia):`, m.amount.toString());
    if (amountStr && !isNaN(parseFloat(amountStr))) {
      const montoRetorno = parseFloat(amountStr);
      const ganancia = montoRetorno - m.amount;
      
      // Crear movimiento de retorno del capital
      const returnMovement: Movement = {
        id: `RET-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        type: MovementType.INGRESO,
        category: 'Inversión Retornada',
        amount: montoRetorno,
        description: `RETORNO: ${m.description} (Capital: $${m.amount.toLocaleString()}, Ganancia: $${ganancia.toLocaleString()})`,
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

      if (ganancia > 0) {
        alert(`¡Inversión retornada con éxito!\n\nCapital recuperado: $${m.amount.toLocaleString()}\nGanancia obtenida: $${ganancia.toLocaleString()}\nTotal recibido: $${montoRetorno.toLocaleString()}`);
      } else if (ganancia < 0) {
        alert(`Inversión retornada.\n\nCapital original: $${m.amount.toLocaleString()}\nPérdida: $${Math.abs(ganancia).toLocaleString()}\nTotal recibido: $${montoRetorno.toLocaleString()}`);
      } else {
        alert(`Inversión retornada sin ganancia ni pérdida.\n\nMonto: $${montoRetorno.toLocaleString()}`);
      }
    }
  };

  const performCorte = () => {
    // Usar el servicio de conciliación para cálculos más robustos
    const conciliacion = ConciliacionService.calcularConciliacion({
      movements,
      inversiones: [], // Se obtendría del estado real en una app completa
      physicalTotal,
      saldoInicial: 0 // Podría venir de un estado persistido
    });

    const validacion = ConciliacionService.validarCorte(conciliacion);
    const summary = ConciliacionService.generarCorteSummary(conciliacion, validacion);

    handleSecurityAction(
      validacion.isBalanced 
        ? "Josué, ¿confirmas el cierre definitivo de este ciclo?" 
        : `⚠ AJUSTE REQUERIDO: ${validacion.mensaje}\n\n¿Deseas proceder de todas formas?`,
      async () => {
        setSelectedCorteForPrint(summary);
        
        const idsToArchive = conciliacion.activeMovements.map(m => m.id);

        // Actualizamos localmente
        setMovements(prev => prev.map(m => 
          idsToArchive.includes(m.id) 
             ? { ...m, status: MovementStatus.ARCHIVADO, cutId: summary.id } 
             : m
        ));
        
        // Enviamos a Firebase Firestore
        try {
          await FirestoreService.performCorte(idsToArchive, summary.id);
        } catch (err) { 
          console.error("Error al registrar corte en Firebase", err);
        }

        setTimeout(() => {
          window.print();
          setSelectedCorteForPrint(null);
          setView('dashboard');
        }, 500);
      }
    );
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
                {view === 'historialCortes' && 'Historial de Cortes'}
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
              />
            )}

            {view === 'historialCortes' && (
              <CortHistory 
                movements={movements}
                onViewDetails={(cutId) => {
                  setSelectedCortDetail({ cutId, isOpen: true });
                }}
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

      <CortDetailModal
        cutId={selectedCortDetail.cutId}
        movements={movements.filter(m => m.cutId === selectedCortDetail.cutId)}
        isOpen={selectedCortDetail.isOpen}
        onClose={() => setSelectedCortDetail({ ...selectedCortDetail, isOpen: false })}
        onPrint={() => {
          window.print();
          setSelectedCortDetail({ ...selectedCortDetail, isOpen: false });
        }}
      />

      <div className="print-only fixed inset-0 z-[9999] bg-white">
        {selectedMovementForPrint && <Receipt movement={selectedMovementForPrint} />}
        {selectedCorteForPrint && <CorteReceipt summary={selectedCorteForPrint} />}
      </div>
    </div>
  );
};

export default App;
