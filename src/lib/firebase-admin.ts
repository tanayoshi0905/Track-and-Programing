// ============================================================
// Firebase Admin SDK — サーバーサイド専用シングルトン
// ============================================================
// 認証情報の読み込み優先順位:
//   1. FIREBASE_SERVICE_ACCOUNT 環境変数 (JSON文字列を直接設定 — Vercel向け)
//   2. FIREBASE_SERVICE_ACCOUNT_PATH 環境変数 (ローカルファイルパス — ローカル開発向け)
// ============================================================

import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { readFileSync } from "fs";
import { resolve } from "path";

function getServiceAccount(): Record<string, string> {
  // 方法1: 環境変数に JSON 文字列が直接入っている場合 (Vercel)
  const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (jsonStr) {
    try {
      return JSON.parse(jsonStr);
    } catch {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT の JSON パースに失敗しました。値が正しい JSON か確認してください。"
      );
    }
  }

  // 方法2: ファイルパスが指定されている場合 (ローカル開発)
  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (filePath) {
    // 動的 import を避けるため require を使用 (サーバーサイドのみ)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const absPath = path.resolve(process.cwd(), filePath);
    try {
      return JSON.parse(fs.readFileSync(absPath, "utf-8"));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(
        `サービスアカウントファイルの読み込みに失敗: ${absPath} — ${msg}`
      );
    }
  }

  throw new Error(
    "Firebase 認証情報が見つかりません。FIREBASE_SERVICE_ACCOUNT (JSON文字列) または FIREBASE_SERVICE_ACCOUNT_PATH (ファイルパス) を設定してください。"
  );
}

function getOrInitApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const serviceAccount = getServiceAccount() as any;
  return initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? `${serviceAccount.project_id}.firebasestorage.app`,
  });
}

let firestoreInstance: Firestore | null = null;

export const db: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (!firestoreInstance) {
      firestoreInstance = getFirestore(getOrInitApp());
    }
    const value = (firestoreInstance as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(firestoreInstance);
    }
    return value;
  },
});

/** Firebase Storage bucket (lazy init) */
export function getStorageBucket() {
  return getStorage(getOrInitApp()).bucket();
}
