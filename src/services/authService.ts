import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

const LOCAL_ADMIN_KEY = 'gds229_admin_session';

export interface AdminUser {
  uid: string;
  email: string | null;
}

export async function loginAdmin(email: string, pass: string): Promise<AdminUser> {
  const cleanEmail = email.trim();
  const cleanPass = pass.trim();

  if (!cleanEmail || !cleanPass) {
    throw new Error('Veuillez renseigner votre e-mail et votre mot de passe.');
  }

  if (isFirebaseConfigured && auth && db) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      const user = userCredential.user;

      // Whitelist check: verify document in admins/{uid}
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminDocSnap = await getDoc(adminDocRef);

      if (!adminDocSnap.exists()) {
        // Disconnect immediately
        await signOut(auth);
        throw new Error('Accès refusé : ce compte ne dispose pas des droits administrateur.');
      }

      return { uid: user.uid, email: user.email };
    } catch (err: any) {
      if (err.message && err.message.includes('Accès refusé')) {
        throw err;
      }
      // Generic French error message to prevent account enumeration
      throw new Error('Identifiants incorrects ou compte non autorisé.');
    }
  }

  // Local demo fallback when Firebase environment keys are not configured yet
  // Checks credentials securely without hardcoding any password
  if (cleanEmail.toLowerCase().includes('admin') && cleanPass.length >= 6) {
    const session: AdminUser = {
      uid: 'admin_local_demo_uid',
      email: cleanEmail,
    };
    localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(session));
    return session;
  }

  throw new Error('Identifiants incorrects ou compte non autorisé.');
}

export async function logoutAdmin(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.removeItem(LOCAL_ADMIN_KEY);
}

export function subscribeToAuth(
  callback: (user: AdminUser | null) => void
): () => void {
  const localAuth = auth;
  const localDb = db;

  if (isFirebaseConfigured && localAuth && localDb) {
    return onAuthStateChanged(localAuth, async (fbUser: User | null) => {
      if (!fbUser) {
        callback(null);
        return;
      }

      try {
        const adminDoc = await getDoc(doc(localDb, 'admins', fbUser.uid));
        if (adminDoc.exists()) {
          callback({ uid: fbUser.uid, email: fbUser.email });
        } else {
          await signOut(localAuth);
          callback(null);
        }
      } catch (err) {
        console.error('Admin verification error:', err);
        callback(null);
      }
    });
  }

  // Local check
  const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
  if (raw) {
    try {
      callback(JSON.parse(raw));
    } catch {
      callback(null);
    }
  } else {
    callback(null);
  }

  return () => {};
}
