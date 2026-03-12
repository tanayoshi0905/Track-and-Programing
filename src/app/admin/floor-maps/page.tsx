// ============================================================
// /admin/floor-maps — Server Component
// Firestore からデータを取得してクライアントコンポーネントに渡す
// ============================================================

import { fetchBuildings } from "@/lib/floor-map-actions";
import FloorMapDashboard from "./floor-map-dashboard";

export const dynamic = "force-dynamic";

export default async function FloorMapsPage() {
  const buildings = await fetchBuildings();

  return <FloorMapDashboard initialBuildings={buildings} />;
}
