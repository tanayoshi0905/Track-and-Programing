import Link from 'next/link';

export default function BuildingDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8 pb-6 border-b">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">建物詳細: {params.id}</h1>
            </header>

            <div className="prose prose-emerald max-w-none">
                <p className="text-gray-700">
                    建物の詳細情報がここに入ります。Firebaseからデータを取得して表示する予定です。
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
