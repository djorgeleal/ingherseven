import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { TemperedGlassRef } from '../types/glass';

const COLLECTION_NAME = 'glassReferences';
const USERS_COLLECTION = 'authorizedUsers';

export const AUTHORIZED_EMAILS = [
  'djorgeleal24@gmail.com',
  'ingherseven@gmail.com'
];

/**
 * Checks if an email is authorized to add/edit references
 */
export function isEmailAuthorized(email?: string | null): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return AUTHORIZED_EMAILS.some((authEmail) => authEmail.toLowerCase() === cleanEmail);
}

/**
 * Ensures authorized emails are stored in the Firestore database
 */
export async function ensureAuthorizedEmailsInDatabase(): Promise<void> {
  try {
    for (const email of AUTHORIZED_EMAILS) {
      const userDocRef = doc(db, USERS_COLLECTION, email);
      await setDoc(
        userDocRef,
        {
          email,
          role: 'admin',
          description: 'Usuario autorizado para agregar y editar referencias de vidrios',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
    console.log('Authorized emails verified in Firestore:', AUTHORIZED_EMAILS);
  } catch (err) {
    console.warn('Notice ensuring authorized users in database:', err);
  }
}

/**
 * Sanitizes reference data to strictly match schema invariants
 */
function sanitizeRef(ref: TemperedGlassRef): TemperedGlassRef {
  // Ensure ID only contains allowed characters: ^[a-zA-Z0-9_\-]+$
  const safeId = ref.id.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 120);

  const cleanData: TemperedGlassRef = {
    id: safeId,
    brand: ref.brand.trim().slice(0, 60),
    primaryModel: ref.primaryModel.trim().slice(0, 120),
    compatibleModels: ref.compatibleModels
      .filter((m) => Boolean(m && m.trim()))
      .map((m) => m.trim().slice(0, 120))
      .slice(0, 100),
    updatedAt: ref.updatedAt || new Date().toISOString(),
  };

  if (ref.notes && ref.notes.trim()) {
    cleanData.notes = ref.notes.trim().slice(0, 500);
  }

  return cleanData;
}

/**
 * Real-time listener for all glass references
 */
export function subscribeToGlassReferences(
  onUpdate: (data: TemperedGlassRef[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: TemperedGlassRef[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data() as TemperedGlassRef;
        items.push({
          id: d.id || docSnap.id,
          brand: d.brand,
          primaryModel: d.primaryModel,
          compatibleModels: Array.isArray(d.compatibleModels) ? d.compatibleModels : [],
          notes: d.notes,
          updatedAt: d.updatedAt,
        });
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
      if (onError) onError(error);
    }
  );
}

/**
 * Saves a single reference to Firestore
 */
export async function saveGlassReferenceToFirestore(ref: TemperedGlassRef): Promise<void> {
  const clean = sanitizeRef(ref);
  const docRef = doc(db, COLLECTION_NAME, clean.id);
  try {
    await setDoc(docRef, clean, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${clean.id}`);
  }
}

/**
 * Deletes a single reference from Firestore
 */
export async function deleteGlassReferenceFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Uploads all references to Firestore in atomic batches
 */
export async function uploadAllToFirestore(
  references: TemperedGlassRef[],
  onProgress?: (saved: number, total: number) => void
): Promise<number> {
  const total = references.length;
  if (total === 0) return 0;

  // Process in chunks of 300 to stay well under the 500-write batch limit
  const chunkSize = 300;
  let count = 0;

  for (let i = 0; i < total; i += chunkSize) {
    const chunk = references.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    chunk.forEach((item) => {
      const clean = sanitizeRef(item);
      const dRef = doc(db, COLLECTION_NAME, clean.id);
      batch.set(dRef, clean, { merge: true });
    });

    try {
      await batch.commit();
      count += chunk.length;
      if (onProgress) onProgress(count, total);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    }
  }

  return count;
}

/**
 * Fetches all references from Firestore directly once
 */
export async function fetchAllFromFirestore(): Promise<TemperedGlassRef[]> {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const items: TemperedGlassRef[] = [];
    snapshot.forEach((docSnap) => {
      items.push(docSnap.data() as TemperedGlassRef);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    return [];
  }
}

/**
 * Automatically uploads all missing brands and models to Firebase Firestore.
 * Ensures the full catalog and any new references are stored in the database.
 */
export async function autoSyncAllToFirestore(
  referencesToSync: TemperedGlassRef[],
  onProgress?: (saved: number, total: number) => void
): Promise<{ uploaded: number; total: number }> {
  try {
    const existing = await fetchAllFromFirestore();
    const existingIds = new Set(existing.map((r) => r.id));

    // Find all references that do not exist yet in Firestore
    const missing = referencesToSync.filter((r) => !existingIds.has(r.id));

    if (missing.length > 0) {
      console.log(`Auto-saving ${missing.length} references to Firebase Firestore...`);
      const count = await uploadAllToFirestore(missing, onProgress);
      return { uploaded: count, total: existing.length + count };
    }

    return { uploaded: 0, total: existing.length };
  } catch (error) {
    console.warn('Notice during autoSyncAllToFirestore:', error);
    throw error;
  }
}
