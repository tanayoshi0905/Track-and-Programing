import Link from 'next/link';
import { db } from '@/lib/firebase-admin';

export const dynamic = "force-dynamic";

export default async function BuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let building = null;
    let error = null;

    try {
        const docRef = await db.collection("buildings").doc(id).get();
        if (docRef.exists) {
            building = {
                id: docRef.id,
                name: docRef.data()?.name || "名称未設定",
                totalFloors: docRef.data()?.totalFloors,
            };
        }
    } catch (e: any) {
        console.error("建物詳細取得エラー:", e);
        error = e.message;
    }

    if (error || !building) {
        return (
            <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center mt-8">
                    <p className="text-sm font-medium text-red-800">{error || "建物が見つかりません"}</p>
                </div>
                <div className="mt-8">
                    <Link href="/buildings" className="text-emerald-600 hover:underline">← 建物一覧に戻る</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8 pb-6 border-b">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{building.name}</h1>
            </header>

            <div className="prose prose-emerald max-w-none">
                <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6">
                    <h2 className="text-xl font-bold mb-4">基本情報</h2>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">階数</dt>
                            <dd className="mt-1 text-base text-gray-900">{building.totalFloors ? `${building.totalFloors}階` : '未設定'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">ID</dt>
                            <dd className="mt-1 text-sm font-mono text-gray-500 bg-gray-50 p-1.5 rounded w-fit">{building.id}</dd>
                        </div>
                    </dl>
                </div>

                <p className="text-gray-700">
                    この建物のフロアマップや、建物内で開催されるイベント・出し物の情報は、イベント詳細画面のマップから確認できます。
                </p>
            </div>

            <div className="mt-12 pt-6 border-t flex flex-wrap gap-4 font-sans">
                <Link href="/buildings" className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-800 hover:underline text-sm font-semibold transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    建物一覧に戻る
                </Link>
                <Link href="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 hover:underline text-sm font-semibold transition-colors">
                    トップページに戻る
                </Link>
            </div>
        </div>
    );
}
