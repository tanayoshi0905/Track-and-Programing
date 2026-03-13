import Link from 'next/link';

export default function BuildingsPage() {
    return (
        <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">建物一覧</h1>
                <p className="mt-2 text-gray-500">学内の各建物の概要をご確認いただけます</p>
            </header>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder data */}
                <Link href="/buildings/main-bldg" className="group flex flex-col p-5 rounded-2xl border hover:border-emerald-300 hover:shadow-md transition-all bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 group-hover:bg-emerald-500 transition-colors"></div>
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mt-1">本館</h2>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">受付、一般展示、各学科のメイン展示が行われます。</p>
                </Link>
                <Link href="/buildings/gym" className="group flex flex-col p-5 rounded-2xl border hover:border-emerald-300 hover:shadow-md transition-all bg-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400 group-hover:bg-emerald-500 transition-colors"></div>
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mt-1">体育館</h2>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">ステージ企画や軽音楽部のライブなどが行われます。</p>
                </Link>
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
