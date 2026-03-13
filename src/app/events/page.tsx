import Link from 'next/link';

export default function EventsPage() {
    return (
        <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">イベント一覧</h1>
                <p className="mt-2 text-gray-500">各種イベントの開催状況をご確認いただけます</p>
            </header>

            <div className="space-y-12">
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        現在開催中
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <p className="text-gray-500 text-sm py-4">現在開催中のイベントはありません</p>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        今後開催予定
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Link href="/events/kosen-fes-2026" className="block p-4 rounded-xl border hover:border-blue-300 hover:shadow-sm transition-all bg-white relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-400 group-hover:bg-blue-500 transition-colors"></div>
                            <h3 className="font-bold text-gray-900 pl-3">高専祭 2026</h3>
                            <p className="text-sm text-gray-500 mt-1 pl-3">マップ・出し物情報を見る</p>
                        </Link>
                    </div>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        終了予定 (終了済み)
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <p className="text-gray-500 text-sm py-4">終了したイベントはありません</p>
                    </div>
                </section>
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
