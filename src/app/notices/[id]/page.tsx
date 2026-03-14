"use client";

import { use } from "react";
import Link from 'next/link';
import { useAnnouncement } from '@/hooks/use-announcement';

export default function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { announcement, loading, error } = useAnnouncement(id);

    if (loading) {
        return (
            <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="text-center py-12">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-orange-600" />
                    <p className="text-sm text-gray-500">お知らせ詳細を読み込み中...</p>
                </div>
            </div>
        );
    }

    if (error || !announcement) {
        return (
            <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center mt-8">
                    <p className="text-sm font-medium text-red-800">{error || "お知らせが見つかりません"}</p>
                </div>
                <div className="mt-8">
                    <Link href="/notices" className="text-orange-600 hover:underline">← お知らせ一覧に戻る</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8 pb-6 border-b">
                <div className="flex items-center gap-3 mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${announcement.type === '重要' ? 'bg-red-100 text-red-800' : announcement.type === '変更' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {announcement.type}
                    </span>
                    <time className="text-sm text-gray-500">{announcement.timestamp}</time>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{announcement.title}</h1>
            </header>

            <div className="prose prose-orange max-w-none bg-white p-6 sm:p-8 rounded-2xl shadow-sm border whitespace-pre-wrap">
                <p className="text-gray-800 leading-relaxed text-base sm:text-lg">
                    {announcement.body}
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
