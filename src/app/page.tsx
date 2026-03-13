import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <main className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">ようこそ</h1>
          <p className="text-gray-500 text-sm">各種情報をご確認ください</p>
        </div>

        <nav className="flex flex-col gap-4">
          <Link
            href="/events"
            className="group flex flex-col p-4 rounded-xl border-2 border-transparent bg-blue-50 hover:border-blue-200 hover:bg-blue-100 transition-all font-sans"
          >
            <h2 className="text-lg font-bold text-blue-900 group-hover:text-blue-700">イベント情報</h2>
            <p className="text-sm text-blue-700/80 mt-1 font-medium">現在開催中・今後の予定</p>
          </Link>

          <Link
            href="/buildings"
            className="group flex flex-col p-4 rounded-xl border-2 border-transparent bg-emerald-50 hover:border-emerald-200 hover:bg-emerald-100 transition-all font-sans"
          >
            <h2 className="text-lg font-bold text-emerald-900 group-hover:text-emerald-700">建物一覧</h2>
            <p className="text-sm text-emerald-700/80 mt-1 font-medium">各建物の概要情報</p>
          </Link>

          <Link
            href="/notices"
            className="group flex flex-col p-4 rounded-xl border-2 border-transparent bg-orange-50 hover:border-orange-200 hover:bg-orange-100 transition-all font-sans"
          >
            <h2 className="text-lg font-bold text-orange-900 group-hover:text-orange-700">お知らせ</h2>
            <p className="text-sm text-orange-700/80 mt-1 font-medium">運営からの最新情報</p>
          </Link>
        </nav>
      </main>
    </div>
  );
}
