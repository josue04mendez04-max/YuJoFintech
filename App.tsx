
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

// URL de implementación de Google Apps Script (Debe estar publicada como 'Anyone' / 'Cualquiera')
const API_URL = 'https://script.google.com/macros/s/AKfycbwDrsC4rdj7i61hVnuy6VVPf5qo0kyS3-o0BPQ7w0F-F3T0BsvTnUG4LYc0RXG3-Cmt/exec';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'notaria' | 'contabilidad' | 'corte'>('dashboard');
  
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
      // Intentamos la petición con un timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(API_URL, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const normalizedData = data.map(m => ({
          ...m,
          amount: Number(m.amount),
          type: m.type as MovementType,
          status: m.status as MovementStatus
        }));
        setMovements(normalizedData);
        setSyncStatus('synced');
        console.log("YuJo: Sincronización exitosa con la nube.");
      } else {
        throw new Error("Formato de datos inválido desde la nube");
      }
    } catch (err: any) {
      const errorMsg = err.name === 'AbortError' ? 'Tiempo de espera agotado' : 'Error de red o permisos (CORS)';
      console.error(`YuJo Sync Error: ${errorMsg}`, err);
      setLastSyncError(err.message === 'Failed to fetch' 
        ? "No se pudo conectar con YuJo Cloud. Verifica que la App Script esté publicada como 'Anyone'." 
        : err.message);
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

    // 2. Persistencia en la nube
    try {
      setSyncStatus('syncing');
      await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'ADD', payload: m })
      });
      setSyncStatus('synced');
      console.log("YuJo: Registro enviado a la nube satisfactoriamente.");
    } catch (error) {
      console.error("Error al enviar movimiento a la nube:", error);
      setSyncStatus('error');
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
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'DELETE', payload: { id } })
        });
      } catch (err) {
        console.error("Error eliminando en nube", err);
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
        await fetch(API_URL, { 
           method: 'POST', 
           body: JSON.stringify({ action: 'ADD', payload: returnMovement }) 
        });
      } catch (err) { 
        console.error("Fallo al registrar retorno en la nube", err);
      }

      alert("Inversión retornada con éxito.");
    }
  };

  const performCorte = () => {
    const active = movements.filter(m => m.status === MovementStatus.PENDIENTE_CORTE);
    const ingresos = active.filter(m => m.type === MovementType.INGRESO).reduce((a, b) => a + b.amount, 0);
    const gastos = active.filter(m => m.type === MovementType.GASTO).reduce((a, b) => a + b.amount, 0);
    
    const summary: CorteSummary = {
      id: `CORTE-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString(),
      ingresosTotal: ingresos,
      gastosTotal: gastos,
      balanceSistema: ingresos - gastos,
      conteoFisico: physicalTotal,
      diferencia: physicalTotal - (ingresos - gastos),
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
      
      // Enviamos a la nube
      try {
        await fetch(API_URL, { 
            method: 'POST', 
            body: JSON.stringify({ 
                action: 'CORTE', 
                payload: { cutId: summary.id, movementIds: idsToArchive } 
            }) 
        });
      } catch (err) { 
        console.error("Error al registrar corte en la nube", err);
      }

      setTimeout(() => {
        window.print();
        setSelectedCorteForPrint(null);
        setView('dashboard');
      }, 500);
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar currentView={view} setView={setView} />
      
      <main className="flex-1 p-10 overflow-y-auto no-print custom-scrollbar">
        <header className="mb-12 flex justify-between items-start border-b border-forest-green/10 pb-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-1">
              <p className="text-mustard font-bold tracking-[0.4em] text-[10px] uppercase">YuJo • Financial Concierge</p>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                syncStatus === 'synced' ? 'bg-green-500/10 text-green-500' : 
                syncStatus === 'syncing' ? 'bg-mustard/10 text-mustard animate-pulse' : 
                'bg-red-500/10 text-red-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  syncStatus === 'synced' ? 'bg-green-500' : 
                  syncStatus === 'syncing' ? 'bg-mustard' : 
                  'bg-red-500'
                }`}></span>
                {syncStatus === 'synced' ? 'Cloud Connected' : syncStatus === 'syncing' ? 'Syncing...' : 'Sync Error'}
              </div>
            </div>
            <h1 className="text-5xl font-serif font-bold italic text-forest-green mb-3">
              {view === 'dashboard' && 'El Atrio'}
              {view === 'notaria' && 'La Notaría'}
              {view === 'contabilidad' && 'La Bóveda'}
              {view === 'corte' && 'Corte de Caja'}
            </h1>
            <p className="text-forest-green/70 text-sm font-medium italic">
              "Hola Josué. Soy YuJo. {syncStatus === 'error' ? 'Estamos trabajando en modo local por problemas de red.' : 'Tu patrimonio está seguro y sincronizado.'}"
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="w-16 h-16 rounded-3xl bg-forest-green text-bone-white flex items-center justify-center font-bold shadow-liquid border border-white/10 text-2xl">J</div>
            {syncStatus === 'error' && (
              <button 
                onClick={fetchMovements}
                className="flex items-center gap-1 text-[9px] font-bold text-mustard uppercase hover:underline"
              >
                <span className="material-symbols-outlined text-xs">sync</span>
                Reintentar Nube
              </button>
            )}
          </div>
        </header>

        {syncStatus === 'error' && movements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4 shadow-inner">
               <span className="material-symbols-outlined text-4xl font-bold">cloud_off</span>
            </div>
            <h3 className="text-xl font-serif font-bold italic text-forest-green mb-2">Error de Conexión</h3>
            <p className="text-sm text-forest-green/50 max-w-sm mb-6">
              {lastSyncError || "No se pudo establecer comunicación con YuJo Cloud."}
            </p>
            <button 
              onClick={fetchMovements}
              className="liquid-btn px-8 py-3 rounded-xl text-forest-green font-bold text-xs uppercase tracking-widest"
            >
              Forzar Reintento
            </button>
          </div>
        ) : (
          <>
            {view === 'dashboard' && (
              <Dashboard 
                movements={movements} 
                onOpenVault={() => setView('contabilidad')} 
                onPerformCut={() => setView('corte')}
                vault={vault}
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
