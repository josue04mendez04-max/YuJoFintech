import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc,
  writeBatch,
  orderBy,
  setDoc,
  onSnapshot,
  Unsubscribe,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase.config';
import { Movement, MovementStatus, MovementType, Inversion, InversionStatus } from './types';

// Collection name for this app
const COLLECTION_NAME = 'yujofintech';
const INVERSIONES_COLLECTION = 'inversiones';

/**
 * Fetch all movements from Firestore
 */
export const fetchMovements = async (): Promise<Movement[]> => {
  try {
    const movementsRef = collection(db, COLLECTION_NAME);
    const q = query(movementsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const movements: Movement[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      movements.push({
        id: doc.id,
        type: data.type,
        category: data.category,
        amount: Number(data.amount),
        description: data.description,
        responsible: data.responsible,
        authorization: data.authorization,
        date: data.date,
        status: data.status,
        cutId: data.cutId
      });
    });
    
    return movements;
  } catch (error) {
    console.error('Error fetching movements from Firestore:', error);
    throw error;
  }
};

/**
 * Add a new movement to Firestore
 */
export const addMovement = async (movement: Movement): Promise<void> => {
  try {
    // Use setDoc with the movement's ID to ensure consistency
    const movementRef = doc(db, COLLECTION_NAME, movement.id);
    await setDoc(movementRef, {
      ...movement,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding movement to Firestore:', error);
    throw error;
  }
};

/**
 * Delete a movement from Firestore
 */
export const deleteMovement = async (id: string): Promise<void> => {
  try {
    const movementRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(movementRef);
  } catch (error) {
    console.error('Error deleting movement from Firestore:', error);
    throw error;
  }
};

/**
 * Update a movement's status (for corte de caja)
 */
export const updateMovementStatus = async (
  id: string, 
  status: MovementStatus, 
  cutId?: string
): Promise<void> => {
  try {
    const movementRef = doc(db, COLLECTION_NAME, id);
    const updateData: { status: MovementStatus; cutId?: string } = { status };
    if (cutId) {
      updateData.cutId = cutId;
    }
    await updateDoc(movementRef, updateData);
  } catch (error) {
    console.error('Error updating movement status in Firestore:', error);
    throw error;
  }
};

/**
 * Perform corte de caja - archive multiple movements at once
 */
export const performCorte = async (
  movementIds: string[], 
  cutId: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    movementIds.forEach((id) => {
      const movementRef = doc(db, COLLECTION_NAME, id);
      batch.update(movementRef, {
        status: MovementStatus.ARCHIVADO,
        cutId: cutId
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error performing corte in Firestore:', error);
    throw error;
  }
};

// ============ INVERSIONES CONGELADAS ============

/**
 * Fetch all inversiones (dinero congelado)
 */
export const fetchInversiones = async (): Promise<Inversion[]> => {
  try {
    const inversionesRef = collection(db, INVERSIONES_COLLECTION);
    const q = query(inversionesRef, orderBy('fechaInicio', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const inversiones: Inversion[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      inversiones.push({
        id: doc.id,
        monto: Number(data.monto),
        descripcion: data.descripcion,
        tipo: data.tipo,
        responsable: data.responsable,
        fechaInicio: data.fechaInicio,
        fechaEstimadaRetorno: data.fechaEstimadaRetorno,
        fechaPromesaRetorno: data.fechaPromesaRetorno,
        status: data.status,
        notas: data.notas,
        timestamp: data.timestamp,
        // Campos para el ciclo de vida
        montoEsperado: data.montoEsperado,
        montoRetornado: data.montoRetornado ? Number(data.montoRetornado) : undefined,
        fechaRetorno: data.fechaRetorno,
        ganancia: data.ganancia
      });
    });
    
    return inversiones;
  } catch (error) {
    console.error('Error fetching inversiones from Firestore:', error);
    throw error;
  }
};

/**
 * Add or update an inversion in real-time to Firestore
 */
export const setInversion = async (inversion: Inversion): Promise<void> => {
  try {
    const inversionRef = doc(db, INVERSIONES_COLLECTION, inversion.id);
    await setDoc(inversionRef, {
      ...inversion,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error setting inversion to Firestore:', error);
    throw error;
  }
};

/**
 * Listen to real-time changes in inversiones
 */
export const listenToInversiones = (
  callback: (inversiones: Inversion[]) => void
): Unsubscribe => {
  const inversionesRef = collection(db, INVERSIONES_COLLECTION);
  const q = query(inversionesRef, orderBy('fechaInicio', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const inversiones: Inversion[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      inversiones.push({
        id: doc.id,
        monto: Number(data.monto),
        descripcion: data.descripcion,
        tipo: data.tipo,
        responsable: data.responsable,
        fechaInicio: data.fechaInicio,
        fechaEstimadaRetorno: data.fechaEstimadaRetorno,
        fechaPromesaRetorno: data.fechaPromesaRetorno,
        status: data.status,
        notas: data.notas,
        timestamp: data.timestamp,
        // Campos para el ciclo de vida
        montoEsperado: data.montoEsperado,
        montoRetornado: data.montoRetornado ? Number(data.montoRetornado) : undefined,
        fechaRetorno: data.fechaRetorno,
        ganancia: data.ganancia
      });
    });
    callback(inversiones);
  }, (error) => {
    console.error('Error listening to inversiones:', error);
  });
};

/**
 * Delete an inversion
 */
export const deleteInversion = async (id: string): Promise<void> => {
  try {
    const inversionRef = doc(db, INVERSIONES_COLLECTION, id);
    await deleteDoc(inversionRef);
  } catch (error) {
    console.error('Error deleting inversion from Firestore:', error);
    throw error;
  }
};

/**
 * Update only specific fields of an inversion (for real-time updates)
 */
export const updateInversion = async (
  id: string,
  updates: Partial<Inversion>
): Promise<void> => {
  try {
    const inversionRef = doc(db, INVERSIONES_COLLECTION, id);
    await updateDoc(inversionRef, {
      ...updates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating inversion in Firestore:', error);
    throw error;
  }
};

/**
 * Liquidar una inversión - Marca la inversión como liquidada y crea un ingreso automático
 * 
 * Esta función realiza dos operaciones atómicas:
 * 1. Actualiza la inversión a status LIQUIDADA con todos los datos de retorno
 * 2. Crea automáticamente un movimiento INGRESO por el monto retornado
 * 
 * @param inversionId - ID de la inversión a liquidar
 * @param montoRetornado - Monto total que regresó (debe ser mayor a 0)
 * @param fechaRetorno - Fecha en que se recibió el retorno (opcional, por defecto hoy)
 * 
 * @throws Error si la inversión no existe
 * @throws Error si la inversión ya está liquidada
 * @throws Error si el montoRetornado es inválido (≤ 0)
 * @throws Error si hay problemas de conexión con Firestore
 * 
 * @example
 * // Liquidar una inversión con ganancia
 * await liquidarInversion('inv-123', 1200);
 * 
 * // Liquidar con fecha específica
 * await liquidarInversion('inv-123', 1200, '2026-01-14');
 */
export const liquidarInversion = async (
  inversionId: string,
  montoRetornado: number,
  fechaRetorno?: string
): Promise<void> => {
  try {
    // Validación de parámetros
    if (!inversionId || inversionId.trim() === '') {
      throw new Error('El ID de la inversión es requerido');
    }
    
    if (montoRetornado <= 0) {
      throw new Error('El monto retornado debe ser mayor a 0');
    }
    
    // 1. Obtener la inversión original
    const inversionRef = doc(db, INVERSIONES_COLLECTION, inversionId);
    const inversionSnapshot = await getDoc(inversionRef);
    
    if (!inversionSnapshot.exists()) {
      throw new Error(`Inversión con ID ${inversionId} no encontrada`);
    }
    
    const inversion = inversionSnapshot.data() as Inversion;
    
    // Validar que la inversión no esté ya liquidada
    if (inversion.status === InversionStatus.LIQUIDADA) {
      throw new Error(`La inversión ${inversionId} ya está liquidada`);
    }
    
    const ganancia = montoRetornado - inversion.monto;
    const fechaRetornoFinal = fechaRetorno || new Date().toISOString().split('T')[0];
    
    // 2. Actualizar la inversión a LIQUIDADA
    await updateDoc(inversionRef, {
      status: InversionStatus.LIQUIDADA,
      montoRetornado: montoRetornado,
      fechaRetorno: fechaRetornoFinal,
      ganancia: ganancia,
      timestamp: new Date().toISOString()
    });
    
    // 3. Crear un nuevo movimiento de INGRESO para el retorno
    const ingresoId = `retorno-inv-${inversionId}-${Date.now()}`;
    const ingresoMovement: Movement = {
      id: ingresoId,
      type: MovementType.INGRESO,
      amount: montoRetornado,
      description: `Retorno Inversión [Folio ${inversionId.substring(0, 8)}] - ${inversion.descripcion}`,
      responsible: inversion.responsable,
      authorization: 'Josué M.',
      date: fechaRetornoFinal,
      status: MovementStatus.PENDIENTE_CORTE
    };
    
    await addMovement(ingresoMovement);
    
    console.log(`YuJo: Inversión ${inversionId} liquidada exitosamente. Ganancia: $${ganancia}`);
  } catch (error) {
    console.error('Error liquidando inversión:', error);
    throw error;
  }
};

// ============ CONTEO DE BÓVEDA ============

/**
 * Save vault count to Firebase
 */
export const saveVaultCount = async (vaultData: any): Promise<void> => {
  try {
    const vaultRef = doc(db, 'vaultCounts', 'current');
    await setDoc(vaultRef, {
      ...vaultData,
      timestamp: new Date().toISOString(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error saving vault count to Firestore:', error);
    throw error;
  }
};

/**
 * Get vault count from Firebase
 */
export const getVaultCount = async (): Promise<any> => {
  try {
    const vaultRef = doc(db, 'vaultCounts', 'current');
    const snapshot = await (await import('firebase/firestore')).getDoc(vaultRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting vault count from Firestore:', error);
    throw error;
  }
};

/**
 * Listen to vault count changes in real-time
 */
export const listenToVaultCount = (
  callback: (vaultData: any) => void
): Unsubscribe => {
  const vaultRef = doc(db, 'vaultCounts', 'current');
  
  return onSnapshot(vaultRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  }, (error) => {
    console.error('Error listening to vault count:', error);
  });
};
