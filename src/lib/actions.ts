"use server";

// ============================================================
// Server Actions — Firestore CRUD
// ============================================================

import { db } from "@/lib/firebase-admin";
import type { EventInfo, MapPin, Announcement } from "@/lib/types";

// 現在のイベントID（MVPでは固定）
const EVENT_ID = "kosen-fes-2026";

// ============================================================
// Events
// ============================================================

/** イベント情報を取得 */
export async function fetchEvent(): Promise<EventInfo | null> {
  const doc = await db.collection("events").doc(EVENT_ID).get();
  if (!doc.exists) return null;
  const data = doc.data()!;
  return {
    id: doc.id,
    name: data.name ?? "",
    date: data.date ?? "",
    subtitle: data.subtitle ?? "",
    isPublished: data.isPublished ?? false,
    mapImageUrl: data.mapImageUrl ?? "",
  };
}

/** イベント情報を更新 */
export async function updateEvent(
  updates: Partial<Omit<EventInfo, "id">>
): Promise<void> {
  await db.collection("events").doc(EVENT_ID).update(updates);
}

// ============================================================
// Locations (Pins)
// ============================================================

/** ロケーション一覧を取得 */
export async function fetchLocations(): Promise<MapPin[]> {
  const snapshot = await db
    .collection("locations")
    .where("eventId", "==", EVENT_ID)
    .get();

  return snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      eventId: EVENT_ID,
      x: d.x ?? 0,
      y: d.y ?? 0,
      name: d.name ?? "",
      shortName: d.shortName ?? "",
      category: d.category ?? "受付",
      description: d.description ?? "",
      openTime: d.openTime ?? "",
      notes: d.notes ?? "",
    };
  });
}

/** ロケーションを追加 */
export async function addLocation(
  pin: Omit<MapPin, "id" | "eventId">
): Promise<string> {
  const ref = await db.collection("locations").add({
    ...pin,
    eventId: EVENT_ID,
    createdAt: new Date(),
  });
  return ref.id;
}

/** ロケーションを更新 */
export async function updateLocation(
  id: string,
  updates: Partial<Omit<MapPin, "id" | "eventId">>
): Promise<void> {
  await db.collection("locations").doc(id).update(updates);
}

/** ロケーションを削除 */
export async function deleteLocation(id: string): Promise<void> {
  await db.collection("locations").doc(id).delete();
}

// ============================================================
// Notices (Announcements)
// ============================================================

/** お知らせ一覧を取得 */
export async function fetchNotices(): Promise<Announcement[]> {
  const snapshot = await db
    .collection("notices")
    .where("eventId", "==", EVENT_ID)
    .get();

  return snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      eventId: EVENT_ID,
      type: d.type ?? "案内",
      title: d.title ?? "",
      body: d.body ?? "",
    };
  });
}

/** お知らせを追加 */
export async function addNotice(
  notice: Omit<Announcement, "id" | "eventId">
): Promise<string> {
  const ref = await db.collection("notices").add({
    ...notice,
    eventId: EVENT_ID,
    createdAt: new Date(),
  });
  return ref.id;
}

/** お知らせを更新 */
export async function updateNotice(
  id: string,
  updates: Partial<Omit<Announcement, "id" | "eventId">>
): Promise<void> {
  await db.collection("notices").doc(id).update(updates);
}

/** お知らせを削除 */
export async function deleteNotice(id: string): Promise<void> {
  await db.collection("notices").doc(id).delete();
}
