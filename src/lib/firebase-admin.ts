// ============================================================
// Firebase Admin SDK 初期化 (サーバーサイド専用)
// ============================================================

import { initializeApp, cert, getApps, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { resolve } from "path";

function getServiceAccount(): ServiceAccount {
  const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!envPath) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_PATH が設定されていません。.env.local を確認してください。"
    );
  }
  const absPath = resolve(process.cwd(), envPath);
  const json = JSON.parse(readFileSync(absPath, "utf-8"));
  return json as ServiceAccount;
}

if (getApps().length === 0) {
  initializeApp({ credential: cert(getServiceAccount()) });
}

export const db = getFirestore();
