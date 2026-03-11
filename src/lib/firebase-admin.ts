// ============================================================
// Firebase Admin SDK — サーバーサイド専用シングルトン
// ============================================================

import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

function getOrInitApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath) {
    throw new Error(
      "GOOGLE_APPLICATION_CREDENTIALS is not set or is empty. Please check your .env.local file."
    );
  }

  const absPath = resolve(process.cwd(), credPath);

  try {
    const serviceAccount = JSON.parse(readFileSync(absPath, "utf-8"));
    return initializeApp({ credential: cert(serviceAccount) });
  } catch (error: any) {
    throw new Error(
      `Failed to initialize Firebase Admin SDK. Error reading or parsing credentials file at ${absPath}: ${error.message}`
    );
  }
}

let firestoreInstance: Firestore | null = null;

export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (!firestoreInstance) {
      firestoreInstance = getFirestore(getOrInitApp());
    }
    const value = (firestoreInstance as any)[prop];
    if (typeof value === "function") {
      return value.bind(firestoreInstance);
    }
    return value;
  },
});
