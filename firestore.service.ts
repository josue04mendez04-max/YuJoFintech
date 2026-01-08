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
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase.config';
import { Movement, MovementStatus, Inversion } from './types';

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
        status: data.status,
        notas: data.notas,
        timestamp: data.timestamp
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
        status: data.status,
        notas: data.notas,
        timestamp: data.timestamp
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
