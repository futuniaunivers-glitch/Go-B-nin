import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../lib/firebase';
import { Category } from '../types';
import { INITIAL_CATEGORIES } from '../lib/defaultData';

const LOCAL_STORAGE_KEY = 'gds229_categories';

function getLocalCategories(): Category[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CATEGORIES));
  return INITIAL_CATEGORIES;
}

function saveLocalCategories(cats: Category[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cats));
}

export async function fetchCategories(): Promise<Category[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      if (snap.empty) {
        return INITIAL_CATEGORIES;
      }
      return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Category));
    } catch (err) {
      console.warn('Firestore fetchCategories fallback to initial categories:', err);
      return getLocalCategories().sort((a, b) => a.order - b.order);
    }
  }

  // Local fallback
  return getLocalCategories().sort((a, b) => a.order - b.order);
}

export async function saveCategory(category: Category): Promise<Category> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'categories', category.id), category, { merge: true });
      return category;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${category.id}`);
    }
  }

  const list = getLocalCategories();
  const idx = list.findIndex((c) => c.id === category.id);
  if (idx >= 0) {
    list[idx] = category;
  } else {
    list.push(category);
  }
  saveLocalCategories(list);
  return category;
}

export async function deleteCategory(categoryId: string, hasProducts: boolean): Promise<void> {
  if (hasProducts) {
    throw new Error(
      'Impossible de supprimer cette catégorie car elle contient des produits. Vous pouvez la désactiver à la place.'
    );
  }

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
      return;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${categoryId}`);
    }
  }

  const list = getLocalCategories().filter((c) => c.id !== categoryId);
  saveLocalCategories(list);
}
