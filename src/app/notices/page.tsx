"use client";

import Link from 'next/link';
import { useEvent } from '@/hooks/use-event';
import { useAnnouncements } from '@/hooks/use-announcements';

export default function NoticesPage() {
    const { eventId, loading: eventLoading } = useEvent();
    const { announcements, loading: announcementsLoading, error: announcementsError } = useAnnouncements(eventId);

    const isLoading = eventLoading || announcementsLoading;

    return (
        <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">お知らせ一覧</h1>
                <p className="mt-2 text-gray-500">運営からの最新情報をご確認いただけます</p>
            </header>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-orange-600" />
                        <p className="text-sm text-gray-500">お知らせを読み込み中...</p>
                    </div>
                ) : announcementsError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center">
                        <p className="text-sm font-medium text-red-800">{announcementsError}</p>
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
