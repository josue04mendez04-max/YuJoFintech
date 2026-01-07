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
  orderBy
} from 'firebase/firestore';
import { db } from './firebase.config';
import { Movement, MovementStatus } from './types';

// Collection name for this app
const COLLECTION_NAME = 'yujofintech';

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
    const movementsRef = collection(db, COLLECTION_NAME);
    await addDoc(movementsRef, {
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
    const updateData: any = { status };
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
