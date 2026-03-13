import Link from 'next/link';
import { db } from '@/lib/firebase-admin';

export const dynamic = "force-dynamic";

export default async function NoticesPage() {
    let announcements: any[] = [];
    let error = null;

    try {
        const eventsSnap = await db.collection("events").where("isPublished", "==", true).limit(1).get();

        if (!eventsSnap.empty) {
            const eventId = eventsSnap.docs[0].id;
            const noticesSnap = await db.collection("notices").where("eventId", "==", eventId).get();

            announcements = noticesSnap.docs.map(doc => {
                const d = doc.data();
                let timestampStr = "";

                if (d.createdAt && typeof d.createdAt.toDate === 'function') {
                    timestampStr = d.createdAt.toDate().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
                } else {
                    timestampStr = String(d.createdAt || "");
                }

                return {
                    id: doc.id,
                    type: d.type || "案内",
                    title: d.title || "",
                    body: d.body || "",
                    createdAtMillis: d.createdAt?.toMillis ? d.createdAt.toMillis() : 0,
                    timestamp: timestampStr,
                };
            });

            // Sort: 1. Important first, 2. Newest first
            announcements.sort((a, b) => {
                const isAImportant = a.type === "重要";
                const isBImportant = b.type === "重要";

                if (isAImportant && !isBImportant) return -1;
                if (!isAImportant && isBImportant) return 1;

                return b.createdAtMillis - a.createdAtMillis;
            });
        }
    } catch (e: any) {
        console.error("お知らせ一覧取得エラー:", e);
        error = e.message;
    }

    return (
        <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">お知らせ一覧</h1>
                <p className="mt-2 text-gray-500">運営からの最新情報をご確認いただけます</p>
            </header>

            <div className="space-y-4">
                {error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center">
                        <p className="text-sm font-medium text-red-800">読み込みに失敗しました: {error}</p>
                    </div>
                ) : announcements.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">現在お知らせはありません</p>
                ) : (
                    announcements.map((announcement) => (
                        <Link key={announcement.id} href={`/notices/${announcement.id}`} className="block p-5 rounded-2xl border hover:border-orange-300 hover:shadow-md transition-all bg-white relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${announcement.type === '重要' ? 'bg-orange-400 group-hover:bg-orange-500' : announcement.type === '変更' ? 'bg-red-400 group-hover:bg-red-500' : 'bg-blue-400 group-hover:bg-blue-500'}`}></div>
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2 pl-3">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md w-fit ${announcement.type === '重要' ? 'bg-orange-100 text-orange-800' : announcement.type === '変更' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {announcement.type}
                                </span>
                                <time className="text-sm text-gray-500">{announcement.timestamp}</time>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 pl-3">{announcement.title}</h2>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2 pl-3">{announcement.body}</p>
                        </Link>
                    ))
                )}
            </div>

            <div className="mt-12 pt-6 border-t font-sans">
                <Link href="/" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline text-sm font-semibold transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    トップページに戻る
                </Link>
            </div>
        </div>
    );
}
