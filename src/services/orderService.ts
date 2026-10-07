import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../lib/firebase';
import { Order, OrderStatus } from '../types';

const LOCAL_STORAGE_KEY = 'gds229_orders';

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [];
}

function saveLocalOrders(orders: Order[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
}

export async function createOrder(
  orderData: Omit<Order, 'id' | 'status' | 'stockDeducted' | 'createdAt'>
): Promise<Order> {
  const id = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newOrder: Order = {
    ...orderData,
    id,
    status: 'new',
    stockDeducted: false,
    acceptedConditions: true,
    isDemo: false,
    createdAt: new Date().toISOString(),
  };

  // Try saving to Firestore if configured
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'orders', id), {
        ...newOrder,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      // Per Section 10: "SI L'ENREGISTREMENT ÉCHOUE, NE PAS BLOQUER : continuer vers WhatsApp (la vente passe avant le suivi)"
      console.warn('Firestore order creation failed, fallback to local storage:', err);
    }
  }

  // Always mirror in localStorage so user and admin can see it
  const list = getLocalOrders();
  list.unshift(newOrder);
  saveLocalOrders(list);

  return newOrder;
}

export async function fetchOrders(): Promise<Order[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      const orders = snap.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
        } as Order;
      });

      // Sort newest first
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return orders;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'orders');
    }
  }

  const local = getLocalOrders();
  return local.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'orders', id));
      if (!snap.exists()) return null;
      const data = snap.data();
      return {
        ...data,
        id: snap.id,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      } as Order;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `orders/${id}`);
    }
  }

  return getLocalOrders().find((o) => o.id === id) || null;
}

/**
 * Updates order status and handles atomic stock deduction/restoration:
 * - If status -> 'confirmed' and stockDeducted === false:
 *   Validates sufficient stock for all items. If any item is insufficient, throws an error with list of items and leaves status unchanged!
 *   If sufficient, deducts stock and sets stockDeducted = true.
 * - If status -> 'cancelled' and stockDeducted === true:
 *   Restores stock and sets stockDeducted = false.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  currentOrder: Order
): Promise<{ success: boolean; error?: string }> {
  const needsDeduction = newStatus === 'confirmed' && !currentOrder.stockDeducted;
  const needsRestoration = newStatus === 'cancelled' && currentOrder.stockDeducted;

  const firestoreDb = db;
  if (isFirebaseConfigured && firestoreDb) {
    try {
      await runTransaction(firestoreDb, async (transaction) => {
        const orderRef = doc(firestoreDb, 'orders', orderId);
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
          throw new Error('Commande introuvable.');
        }

        const freshOrder = orderDoc.data() as Order;
        const willDeduct = newStatus === 'confirmed' && !freshOrder.stockDeducted;
        const willRestore = newStatus === 'cancelled' && freshOrder.stockDeducted;

        if (willDeduct) {
          // Read all products first
          const productDocs: { ref: any; data: any; item: any }[] = [];
          const insufficientList: string[] = [];

          for (const item of freshOrder.items) {
            const prodRef = doc(firestoreDb, 'products', item.productId);
            const prodSnap = await transaction.get(prodRef);
            if (!prodSnap.exists()) {
              insufficientList.push(`${item.name} (produit inexistant)`);
              continue;
            }
            const prodData = prodSnap.data();
            const currentStock = prodData.stock || 0;
            if (currentStock < item.quantity) {
              insufficientList.push(
                `${item.name} (en stock : ${currentStock}, requis : ${item.quantity})`
              );
            }
            productDocs.push({ ref: prodRef, data: prodData, item });
          }

          if (insufficientList.length > 0) {
            throw new Error(
              `Stock insuffisant pour confirmer la commande :\n• ${insufficientList.join('\n• ')}`
            );
          }

          // Apply stock deductions
          for (const p of productDocs) {
            transaction.update(p.ref, {
              stock: p.data.stock - p.item.quantity,
              updatedAt: serverTimestamp(),
            });
          }

          transaction.update(orderRef, {
            status: newStatus,
            stockDeducted: true,
            updatedAt: serverTimestamp(),
          });
        } else if (willRestore) {
          // Restoring stock on cancellation
          for (const item of freshOrder.items) {
            const prodRef = doc(firestoreDb, 'products', item.productId);
            const prodSnap = await transaction.get(prodRef);
            if (prodSnap.exists()) {
              const currentStock = prodSnap.data().stock || 0;
              transaction.update(prodRef, {
                stock: currentStock + item.quantity,
                updatedAt: serverTimestamp(),
              });
            }
          }

          transaction.update(orderRef, {
            status: newStatus,
            stockDeducted: false,
            updatedAt: serverTimestamp(),
          });
        } else {
          // Normal status change without stock modification
          transaction.update(orderRef, {
            status: newStatus,
            updatedAt: serverTimestamp(),
          });
        }
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error updating order status:', err);
      return { success: false, error: err.message || 'Erreur lors de la mise à jour.' };
    }
  }

  // Local fallback simulation with exact same business logic
  try {
    const rawProds = localStorage.getItem('gds229_products');
    const products: any[] = rawProds ? JSON.parse(rawProds) : [];

    if (needsDeduction) {
      const insufficientList: string[] = [];
      for (const item of currentOrder.items) {
        const prod = products.find((p) => p.id === item.productId);
        if (!prod || (prod.stock || 0) < item.quantity) {
          insufficientList.push(
            `${item.name} (en stock : ${prod ? prod.stock : 0}, requis : ${item.quantity})`
          );
        }
      }

      if (insufficientList.length > 0) {
        return {
          success: false,
          error: `Stock insuffisant pour confirmer la commande :\n• ${insufficientList.join('\n• ')}`,
        };
      }

      // Deduct
      for (const item of currentOrder.items) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod) prod.stock = Math.max(0, prod.stock - item.quantity);
      }
      localStorage.setItem('gds229_products', JSON.stringify(products));
      currentOrder.stockDeducted = true;
    } else if (needsRestoration) {
      // Restore
      for (const item of currentOrder.items) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod) prod.stock += item.quantity;
      }
      localStorage.setItem('gds229_products', JSON.stringify(products));
      currentOrder.stockDeducted = false;
    }

    currentOrder.status = newStatus;
    const orders = getLocalOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      orders[idx] = currentOrder;
      saveLocalOrders(orders);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur lors de la mise à jour.' };
  }
}
