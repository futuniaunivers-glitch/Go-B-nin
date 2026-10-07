import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, isFirebaseConfigured, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../lib/defaultData';
import { ProcessedImages } from '../lib/images';

const LOCAL_STORAGE_KEY = 'gds229_products';

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(products: Product[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
}

export async function fetchProducts(onlyActive = false): Promise<Product[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = onlyActive
        ? query(collection(db, 'products'), where('isActive', '==', true))
        : collection(db, 'products');

      const snap = await getDocs(q);
      if (snap.empty) {
        // Fall back to initial products if Firestore has no records yet
        return onlyActive ? INITIAL_PRODUCTS.filter((p) => p.isActive) : INITIAL_PRODUCTS;
      }
      return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Product));
    } catch (err) {
      console.warn('Firestore fetchProducts fallback to local data:', err);
      const local = getLocalProducts();
      return onlyActive ? local.filter((p) => p.isActive) : local;
    }
  }

  const local = getLocalProducts();
  return onlyActive ? local.filter((p) => p.isActive) : local;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'products', id));
      if (!snap.exists()) {
        const foundLocal = getLocalProducts().find((p) => p.id === id);
        return foundLocal || null;
      }
      return { ...snap.data(), id: snap.id } as Product;
    } catch (err) {
      console.warn('Firestore fetchProductById fallback to local:', err);
      const found = getLocalProducts().find((p) => p.id === id);
      return found || null;
    }
  }

  const found = getLocalProducts().find((p) => p.id === id);
  return found || null;
}

export async function uploadProductImages(
  productId: string,
  images: ProcessedImages
): Promise<{ imageUrl: string; thumbUrl: string; imagePath: string; thumbPath: string }> {
  if (isFirebaseConfigured && storage) {
    const timestamp = Date.now();
    const mainPath = `products/${productId}/main_${timestamp}.webp`;
    const thumbPath = `products/${productId}/thumb_${timestamp}.webp`;

    const mainRef = ref(storage, mainPath);
    const thumbRef = ref(storage, thumbPath);

    await uploadBytes(mainRef, images.mainBlob, { contentType: 'image/webp' });
    await uploadBytes(thumbRef, images.thumbBlob, { contentType: 'image/webp' });

    const imageUrl = await getDownloadURL(mainRef);
    const thumbUrl = await getDownloadURL(thumbRef);

    return { imageUrl, thumbUrl, imagePath: mainPath, thumbPath };
  }

  // Fallback for local demo mode using DataURL
  const blobToDataURL = (blob: Blob): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

  const mainDataUrl = await blobToDataURL(images.mainBlob);
  const thumbDataUrl = await blobToDataURL(images.thumbBlob);

  return {
    imageUrl: mainDataUrl,
    thumbUrl: thumbDataUrl,
    imagePath: null as unknown as string,
    thumbPath: null as unknown as string,
  };
}

export async function deleteStorageImage(path: string | null): Promise<void> {
  if (!path || !isFirebaseConfigured || !storage) return;
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  } catch (err) {
    console.warn('Could not delete storage image:', path, err);
  }
}

export async function saveProduct(
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  processedImages?: ProcessedImages | null,
  previousProduct?: Product | null
): Promise<Product> {
  const id = productData.id || `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  let imageUrl = productData.imageUrl;
  let thumbUrl = productData.thumbUrl;
  let imagePath = productData.imagePath;
  let thumbPath = productData.thumbPath;

  if (processedImages) {
    // If updating, delete previous files from Storage
    if (previousProduct?.imagePath) {
      await deleteStorageImage(previousProduct.imagePath);
    }
    if (previousProduct?.thumbPath) {
      await deleteStorageImage(previousProduct.thumbPath);
    }

    const uploaded = await uploadProductImages(id, processedImages);
    imageUrl = uploaded.imageUrl;
    thumbUrl = uploaded.thumbUrl;
    imagePath = uploaded.imagePath;
    thumbPath = uploaded.thumbPath;
  }

  const finalProduct: Product = {
    ...productData,
    id,
    imageUrl: imageUrl || null,
    thumbUrl: thumbUrl || null,
    imagePath: imagePath || null,
    thumbPath: thumbPath || null,
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(
        doc(db, 'products', id),
        {
          ...finalProduct,
          createdAt: previousProduct?.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return finalProduct;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${id}`);
    }
  }

  const localList = getLocalProducts();
  const idx = localList.findIndex((p) => p.id === id);
  if (idx >= 0) {
    localList[idx] = finalProduct;
  } else {
    localList.unshift(finalProduct);
  }
  saveLocalProducts(localList);
  return finalProduct;
}

export async function deleteProduct(productId: string): Promise<void> {
  const existing = await fetchProductById(productId);
  if (existing) {
    if (existing.imagePath) await deleteStorageImage(existing.imagePath);
    if (existing.thumbPath) await deleteStorageImage(existing.thumbPath);
  }

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'products', productId));
      return;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
    }
  }

  const filtered = getLocalProducts().filter((p) => p.id !== productId);
  saveLocalProducts(filtered);
}

export async function updateProductStock(productId: string, newStock: number): Promise<void> {
  const safeStock = Math.max(0, Math.round(newStock));
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'products', productId), {
        stock: safeStock,
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
    }
  }

  const list = getLocalProducts();
  const item = list.find((p) => p.id === productId);
  if (item) {
    item.stock = safeStock;
    item.updatedAt = new Date().toISOString();
    saveLocalProducts(list);
  }
}

export async function toggleProductActive(productId: string, isActive: boolean): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'products', productId), {
        isActive,
        updatedAt: serverTimestamp(),
      });
      return;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
    }
  }

  const list = getLocalProducts();
  const item = list.find((p) => p.id === productId);
  if (item) {
    item.isActive = isActive;
    item.updatedAt = new Date().toISOString();
    saveLocalProducts(list);
  }
}
