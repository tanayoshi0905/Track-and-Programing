// ============================================================
// /admin — Server Component
// Firestore からデータを取得してクライアントコンポーネントに渡す
// ============================================================

import { fetchEvent, fetchLocations, fetchNotices } from "@/lib/actions";
import AdminDashboard from "./admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [event, locations, notices] = await Promise.all([
    fetchEvent(),
    fetchLocations(),
    fetchNotices(),
  ]);

  return (
    <AdminDashboard
      initialEvent={event}
      initialPins={locations}
      initialAnnouncements={notices}
    />
  );
}
