// ============================================================
// Firestore シードスクリプト
// Firebase Admin SDK を使って Firestore にデータを一括投入する
//
// 使い方:
//   1. Firebase Console → プロジェクトの設定 → サービスアカウント
//      → 新しい秘密鍵の生成 → JSON ファイルをダウンロード
//   2. ダウンロードしたファイルをこのディレクトリに
//      `serviceAccountKey.json` として保存
//   3. 実行:
//      source ~/.nvm/nvm.sh && nvm use 20
//      node scripts/seed-firestore.mjs
// ============================================================

import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---- サービスアカウントキー読み込み ----
const keyPath = resolve(__dirname, "../trackandprograming-firebase-adminsdk-fbsvc-b49ca59663.json");
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
} catch {
  console.error(
    "❌ serviceAccountKey.json が見つかりません。\n" +
      "   Firebase Console からサービスアカウントキーをダウンロードし、\n" +
      `   ${keyPath} に保存してください。`
  );
  process.exit(1);
}

// ---- Firebase 初期化 ----
initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore();

// ============================================================
// シードデータ
// ============================================================

const seedData = {
  events: [
    {
      id: "kosen-fes-2026",
      name: "高専祭 2026",
      subtitle: "教室・受付・出し物情報を地図から確認できます",
      date: "2026-03-20",
      mapImageUrl: "/sample-map.png",
      isPublished: true,
    },
  ],

  locations: [
    {
      id: "loc-001",
      eventId: "kosen-fes-2026",
      name: "受付",
      shortName: "受付",
      category: "受付",
      description: "来場受付です",
      openTime: "09:00-16:00",
      notes: "パンフレットを配布します",
      x: 12.5,
      y: 20.3,
    },
  ],

  notices: [
    {
      id: "notice-001",
      eventId: "kosen-fes-2026",
      type: "案内",
      title: "本日の開場時刻",
      body: "9:00より開場します",
    },
  ],
};

// ============================================================
// 書き込み処理
// ============================================================

async function seed() {
  console.log("🔥 Firestore シード開始...\n");

  const batch = db.batch();
  let count = 0;

  // events コレクション
  for (const event of seedData.events) {
    const { id, ...data } = event;
    const ref = db.collection("events").doc(id);
    batch.set(ref, { ...data, createdAt: new Date() });
    count++;
    console.log(`  📌 events/${id}`);
  }

  // locations コレクション
  for (const location of seedData.locations) {
    const { id, ...data } = location;
    const ref = db.collection("locations").doc(id);
    batch.set(ref, { ...data, createdAt: new Date() });
    count++;
    console.log(`  📌 locations/${id}`);
  }

  // notices コレクション
  for (const notice of seedData.notices) {
    const { id, ...data } = notice;
    const ref = db.collection("notices").doc(id);
    batch.set(ref, { ...data, createdAt: new Date() });
    count++;
    console.log(`  📌 notices/${id}`);
  }

  // コミット
  await batch.commit();
  console.log(`\n✅ ${count} 件のドキュメントを Firestore に書き込みました。`);
}

seed().catch((err) => {
  console.error("❌ シード失敗:", err);
  process.exit(1);
});
