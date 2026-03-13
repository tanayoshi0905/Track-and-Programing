import Link from 'next/link';

export default function NoticeDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8 pb-6 border-b">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-800 rounded-md">お知らせ</span>
                    <time className="text-sm text-gray-500">2026.03.13</time>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">お知らせ詳細: {params.id}</h1>
            </header>

            <div className="prose prose-orange max-w-none">
                <p className="text-gray-700 leading-relaxed">
                    お知らせ本文がここに入ります。Firebaseからデータを取得して表示する予定です。
                    現在はプレースホルダーとしてID <strong>{params.id}</strong> を表示しています。
                </p>
            </div>

            <div className="mt-12 pt-6 border-t flex flex-wrap gap-4 font-sans">
                <Link href="/notices" className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-800 hover:underline text-sm font-semibold transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    お知らせ一覧に戻る
                </Link>
                <Link href="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800 hover:underline text-sm font-semibold transition-colors">
                    トップページに戻る
                </Link>
            </div>
        </div>
    );
}
