import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  Student,
  OrphanRecord,
  LabEquipment,
  LabSession,
  EquipmentAllocation,
  Player,
  Match,
  Trophy,
  CommunityEvent,
  InstagramPost,
  Sponsorship,
  FeeNotification,
} from '../types';

// Collection Names
export const COLLECTIONS = {
  STUDENTS: 'students',
  ORPHANS: 'orphans',
  LAB_EQUIPMENT: 'lab_equipment',
  LAB_SESSIONS: 'lab_sessions',
  EQUIPMENT_ALLOCATIONS: 'equipment_allocations',
  PLAYERS: 'players',
  MATCHES: 'matches',
  TROPHIES: 'trophies',
  EVENTS: 'community_events',
  INSTAGRAM_POSTS: 'instagram_posts',
  SPONSORSHIPS: 'sponsorships',
  FEE_NOTIFICATIONS: 'fee_notifications',
};

// Generic Firestore Sync Subscriptions
export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  onError?: (error: Error) => void
) {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as T), id: docSnap.id });
      });
      onUpdate(items);
    },
    (err) => {
      console.error(`Error subscribing to ${collectionName}:`, err);
      if (onError) onError(err);
    }
  );
}

// Generic Document Operations
export async function saveDocument<T extends { id: string }>(
  collectionName: string,
  item: T
): Promise<void> {
  const docRef = doc(db, collectionName, item.id);
  await setDoc(docRef, item, { merge: true });
}

export async function removeDocument(
  collectionName: string,
  id: string
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

export async function saveMultipleDocuments<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  const batch = writeBatch(db);
  items.forEach((item) => {
    const docRef = doc(db, collectionName, item.id);
    batch.set(docRef, item, { merge: true });
  });
  await batch.commit();
}
