import Link from 'next/link';
import { db } from '@/lib/firebase-admin';

export const dynamic = "force-dynamic";

export default async function BuildingsPage() {
    let buildings: any[] = [];
    let error = null;

    try {
        const snap = await db.collection("buildings").get();
        buildings = snap.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || "名称未設定",
            totalFloors: doc.data().totalFloors,
        }));
    } catch (e: any) {
        console.error("建物取得エラー:", e);
        error = e.message;
    }

    return (
        <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">建物一覧</h1>
                <p className="mt-2 text-gray-500">学内の各建物の概要をご確認いただけます</p>
            </header>

            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center">
                    <p className="text-sm font-medium text-red-800">読み込みに失敗しました: {error}</p>
                </div>
            ) : buildings.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">現在登録されている建物はありません</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {buildings.map((building) => (
                        <Link key={building.id} href={`/buildings/${building.id}`} className="group flex flex-col p-5 rounded-2xl border hover:border-emerald-300 hover:shadow-md transition-all bg-white relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 group-hover:bg-emerald-500 transition-colors"></div>
                            <h2 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mt-1">{building.name}</h2>
                            {building.totalFloors ? (
                                <p className="text-sm text-gray-500 mt-2">階数: {building.totalFloors}階</p>
                            ) : (
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">建物の詳細を確認する</p>
                            )}
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-12 pt-6 border-t font-sans">
                <Link href="/" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline text-sm font-semibold transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    トップページに戻る
                </Link>
            </div>
        </div>
    );
}
