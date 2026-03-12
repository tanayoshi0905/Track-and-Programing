"use server";

// ============================================================
// Server Actions — 階層別マップ + OCR
// Storage 不使用 — 画像は base64 で Firestore に直接保存
// ============================================================

import { db } from "@/lib/firebase-admin";
import { performOcr } from "@/lib/ocr";
import type {
  Building,
  FloorMap,
  OcrResult,
  OcrStatus,
} from "@/lib/types";

// ============================================================
// Buildings
// ============================================================

/** 建物を作成 */
export async function createBuilding(
  name: string,
  totalFloors: number
): Promise<string> {
  const ref = await db.collection("buildings").add({
    name,
    totalFloors,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

/** 建物一覧を取得 */
export async function fetchBuildings(): Promise<Building[]> {
  const snap = await db.collection("buildings").get();
  const docs = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      name: d.name ?? "",
      totalFloors: d.totalFloors ?? 1,
      createdAt: d.createdAt ?? "",
    };
  });
  // クライアント側でソート（composite index 不要）
  return docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ============================================================
// Floor Maps
// ============================================================

/** フロアマップをアップロード（base64 で Firestore に保存） */
export async function uploadFloorMap(
  buildingId: string,
  floorNumber: number,
  fileBase64: string,
  fileName: string,
  fileType: string
): Promise<string> {
  // data URL として保存（クライアントでそのまま <img src> に使える）
  const downloadUrl = `data:${fileType};base64,${fileBase64}`;

  const ref = await db.collection("floorMaps").add({
    buildingId,
    floorNumber,
    fileName,
    fileType,
    storagePath: "",
    downloadUrl,
    fileBase64,
    ocrStatus: "uploaded" as OcrStatus,
    createdAt: new Date().toISOString(),
  });

  return ref.id;
}

/** 特定建物のフロアマップ一覧を取得 */
export async function fetchFloorMaps(buildingId: string): Promise<FloorMap[]> {
  const snap = await db
    .collection("floorMaps")
    .where("buildingId", "==", buildingId)
    .get();

  const docs = snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      buildingId: d.buildingId,
      floorNumber: d.floorNumber,
      fileName: d.fileName ?? "",
      fileType: d.fileType ?? "",
      storagePath: d.storagePath ?? "",
      downloadUrl: d.downloadUrl ?? "",
      ocrStatus: (d.ocrStatus ?? "none") as OcrStatus,
    };
  });
  // クライアント側でソート（composite index 不要）
  return docs.sort((a, b) => a.floorNumber - b.floorNumber);
}

/** フロアマップを削除 */
export async function deleteFloorMap(floorMapId: string): Promise<void> {
  const doc = await db.collection("floorMaps").doc(floorMapId).get();
  if (!doc.exists) return;

  // 関連する ocrResults も削除
  const ocrSnap = await db
    .collection("ocrResults")
    .where("sourceFloorMapId", "==", floorMapId)
    .get();
  const batch = db.batch();
  ocrSnap.docs.forEach((ocrDoc) => batch.delete(ocrDoc.ref));
  batch.delete(doc.ref);
  await batch.commit();
}

// ============================================================
// OCR
// ============================================================

/** OCR を実行して結果を保存 */
export async function runOcr(floorMapId: string): Promise<OcrResult | null> {
  const doc = await db.collection("floorMaps").doc(floorMapId).get();
  if (!doc.exists) return null;

  const floorMap = doc.data()!;

  // ステータスを processing に更新
  await db.collection("floorMaps").doc(floorMapId).update({
    ocrStatus: "processing" as OcrStatus,
  });

  try {
    // Firestore から base64 データを取得してバッファに変換
    const base64Data: string = floorMap.fileBase64 ?? "";
    if (!base64Data) {
      throw new Error("fileBase64 data not found in Firestore document");
    }
    const buffer = Buffer.from(base64Data, "base64");

    if (floorMap.fileType === "application/pdf") {
      // PDF の場合はテキスト抽出のみ（画像変換は MVP 外）
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      await parser.destroy();

      const texts = textResult.text
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);

      const result: Omit<OcrResult, "id"> = {
        buildingId: floorMap.buildingId,
        floorNumber: floorMap.floorNumber,
        sourceFloorMapId: floorMapId,
        extractedTexts: texts,
        roomCandidates: [],
        simplifiedMapData: { source: "pdf-parse", pageCount: textResult.pages.length },
      };

      // 既存の ocrResult を削除してから新規作成
      const existing = await db
        .collection("ocrResults")
        .where("sourceFloorMapId", "==", floorMapId)
        .get();
      const batch = db.batch();
      existing.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();

      const ref = await db.collection("ocrResults").add(result);

      await db.collection("floorMaps").doc(floorMapId).update({
        ocrStatus: "done" as OcrStatus,
      });

      return { id: ref.id, ...result };
    }

    // 画像の場合
    const ocrOutput = await performOcr(buffer);

    const result: Omit<OcrResult, "id"> = {
      buildingId: floorMap.buildingId,
      floorNumber: floorMap.floorNumber,
      sourceFloorMapId: floorMapId,
      extractedTexts: ocrOutput.extractedTexts,
      roomCandidates: ocrOutput.roomCandidates,
      simplifiedMapData: { source: "tesseract.js" },
    };

    // 既存の ocrResult を削除してから新規作成
    const existing = await db
      .collection("ocrResults")
      .where("sourceFloorMapId", "==", floorMapId)
      .get();
    const batch = db.batch();
    existing.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    const ref = await db.collection("ocrResults").add(result);

    await db.collection("floorMaps").doc(floorMapId).update({
      ocrStatus: "done" as OcrStatus,
    });

    return { id: ref.id, ...result };
  } catch (error) {
    console.error("OCR error:", error);
    await db.collection("floorMaps").doc(floorMapId).update({
      ocrStatus: "error" as OcrStatus,
    });
    return null;
  }
}

/** OCR 結果を取得 */
export async function fetchOcrResult(
  floorMapId: string
): Promise<OcrResult | null> {
  const snap = await db
    .collection("ocrResults")
    .where("sourceFloorMapId", "==", floorMapId)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const doc = snap.docs[0];
  const d = doc.data();
  return {
    id: doc.id,
    buildingId: d.buildingId ?? "",
    floorNumber: d.floorNumber ?? 0,
    sourceFloorMapId: d.sourceFloorMapId ?? "",
    extractedTexts: d.extractedTexts ?? [],
    roomCandidates: d.roomCandidates ?? [],
    simplifiedMapData: d.simplifiedMapData ?? {},
  };
}
