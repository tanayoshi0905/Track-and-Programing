"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  MapPin as MapPinIcon,
  Upload,
  Bell,
  Settings,
  Trash2,
  Pencil,
  Plus,
  ExternalLink,
  Copy,
  QrCode,
  ImageIcon,
  X,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import {
  EventInfo,
  MapPin,
  Announcement,
  PinCategory,
  AnnouncementType,
  PIN_CATEGORIES,
  ANNOUNCEMENT_TYPES,
} from "@/lib/types";
import {
  updateEvent as updateEventAction,
  addLocation,
  updateLocation,
  deleteLocation,
  addNotice,
  updateNotice,
  deleteNotice,
} from "@/lib/actions";

// ============================================================
// ユーティリティ
// ============================================================

const EVENT_ID = "kosen-fes-2026";
const PUBLIC_BASE_URL = "https://example.com/event";

function announcementBadgeVariant(type: AnnouncementType) {
  switch (type) {
    case "重要":
      return "destructive" as const;
    case "変更":
      return "default" as const;
    case "案内":
      return "secondary" as const;
  }
}

function categoryColor(cat: PinCategory): string {
  const map: Record<PinCategory, string> = {
    受付: "#3b82f6",
    飲食: "#f97316",
    展示: "#8b5cf6",
    体験: "#10b981",
    設備: "#6b7280",
    トイレ: "#06b6d4",
  };
  return map[cat] ?? "#6b7280";
}

// デフォルトのイベント情報（Firestoreにデータがない場合）
const DEFAULT_EVENT: EventInfo = {
  id: EVENT_ID,
  name: "",
  date: "",
  subtitle: "",
  isPublished: false,
  mapImageUrl: "",
};

// ============================================================
// Props
// ============================================================

interface AdminDashboardProps {
  initialEvent: EventInfo | null;
  initialPins: MapPin[];
  initialAnnouncements: Announcement[];
}

// ============================================================
// メインコンポーネント
// ============================================================

export default function AdminDashboard({
  initialEvent,
  initialPins,
  initialAnnouncements,
}: AdminDashboardProps) {
  // ---- State ----
  const [event, setEvent] = useState<EventInfo>(
    initialEvent ?? DEFAULT_EVENT
  );
  const [mapImage, setMapImage] = useState<string | null>(
    initialEvent?.mapImageUrl || null
  );
  const [pins, setPins] = useState<MapPin[]>(initialPins);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(initialAnnouncements);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<
    string | null
  >(null);
  const [saving, setSaving] = useState(false);

  // Announcement form state
  const [annForm, setAnnForm] = useState<{
    type: AnnouncementType;
    title: string;
    body: string;
  }>({ type: "案内", title: "", body: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // ---- Derived ----
  const selectedPin = pins.find((p) => p.id === selectedPinId) ?? null;
  const publicUrl = `${PUBLIC_BASE_URL}/${encodeURIComponent(event.name)}`;

  // ---- Handlers: Event ----
  const handleUpdateEvent = useCallback(
    async (partial: Partial<EventInfo>) => {
      setEvent((prev) => ({ ...prev, ...partial }));
      try {
        const { id, ...rest } = partial as Partial<EventInfo> & { id?: string };
        void id; // exclude id from update
        await updateEventAction(rest);
      } catch (err) {
        console.error("イベント更新エラー:", err);
      }
    },
    []
  );

  // ---- Handlers: Map Image ----
  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setMapImage(url);
      // 注: 画像のアップロード先（Storage等）はMVPでは未実装
    },
    []
  );

  // ---- Handlers: Pins ----
  const handleMapClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mapImage) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const pinData = {
        x,
        y,
        name: "",
        shortName: "",
        category: "受付" as PinCategory,
        description: "",
        openTime: "",
        notes: "",
      };

      // 楽観的更新
      const tempId = `temp-${Date.now()}`;
      const tempPin: MapPin = { id: tempId, eventId: EVENT_ID, ...pinData };
      setPins((prev) => [...prev, tempPin]);
      setSelectedPinId(tempId);

      try {
        const firestoreId = await addLocation(pinData);
        // temp ID を Firestore ID に差し替え
        setPins((prev) =>
          prev.map((p) =>
            p.id === tempId
              ? { ...p, id: firestoreId }
              : p
          )
        );
        setSelectedPinId(firestoreId);
      } catch (err) {
        console.error("ピン追加エラー:", err);
        setPins((prev) => prev.filter((p) => p.id !== tempId));
        setSelectedPinId(null);
      }
    },
    [mapImage]
  );

  const handleUpdatePin = useCallback(
    async (id: string, partial: Partial<MapPin>) => {
      setPins((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...partial } : p))
      );
      try {
        const { id: _id, eventId: _eid, ...rest } = partial as Partial<MapPin> & { id?: string; eventId?: string };
        void _id;
        void _eid;
        await updateLocation(id, rest);
      } catch (err) {
        console.error("ピン更新エラー:", err);
      }
    },
    []
  );

  const handleDeletePin = useCallback(
    async (id: string) => {
      setPins((prev) => prev.filter((p) => p.id !== id));
      if (selectedPinId === id) setSelectedPinId(null);
      try {
        await deleteLocation(id);
      } catch (err) {
        console.error("ピン削除エラー:", err);
      }
    },
    [selectedPinId]
  );

  // ---- Handlers: Announcements ----
  const resetAnnForm = () => {
    setAnnForm({ type: "案内", title: "", body: "" });
    setEditingAnnouncementId(null);
  };

  const saveAnnouncement = async () => {
    if (!annForm.title.trim()) return;
    setSaving(true);
    try {
      if (editingAnnouncementId) {
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === editingAnnouncementId ? { ...a, ...annForm } : a
          )
        );
        await updateNotice(editingAnnouncementId, annForm);
      } else {
        const id = await addNotice(annForm);
        setAnnouncements((prev) => [
          ...prev,
          { id, eventId: EVENT_ID, ...annForm },
        ]);
      }
      resetAnnForm();
    } catch (err) {
      console.error("お知らせ保存エラー:", err);
    } finally {
      setSaving(false);
    }
  };

  const startEditAnnouncement = (ann: Announcement) => {
    setEditingAnnouncementId(ann.id);
    setAnnForm({ type: ann.type, title: ann.title, body: ann.body });
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    if (editingAnnouncementId === id) resetAnnForm();
    try {
      await deleteNotice(id);
    } catch (err) {
      console.error("お知らせ削除エラー:", err);
    }
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* ---- Header ---- */}
      <header className="border-b bg-white px-6 py-5 md:px-10">
        <div className="max-w-6xl">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="size-5 text-primary" />
            イベント管理画面
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            配置図・地点情報・お知らせを登録して公開準備を行う
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8 md:px-10">
        {/* ============================================================
            セクション1: イベント基本情報
         ============================================================ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="size-4 text-primary" />
              イベント基本情報
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="event-name">イベント名</Label>
                <Input
                  id="event-name"
                  value={event.name}
                  onChange={(e) =>
                    setEvent((prev) => ({ ...prev, name: e.target.value }))
                  }
                  onBlur={() => handleUpdateEvent({ name: event.name })}
                  placeholder="例: 高専祭 2026"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event-date">開催日</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={event.date}
                  onChange={(e) =>
                    setEvent((prev) => ({ ...prev, date: e.target.value }))
                  }
                  onBlur={() => handleUpdateEvent({ date: event.date })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-subtitle">サブタイトル</Label>
              <Input
                id="event-subtitle"
                value={event.subtitle}
                onChange={(e) =>
                  setEvent((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                onBlur={() => handleUpdateEvent({ subtitle: event.subtitle })}
                placeholder="例: 教室・受付・出し物情報を地図から確認できます"
              />
            </div>

            <Separator />

            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-3">
                <Switch
                  id="publish-toggle"
                  checked={event.isPublished}
                  onCheckedChange={(checked: boolean) =>
                    handleUpdateEvent({ isPublished: checked })
                  }
                />
                <Label htmlFor="publish-toggle" className="cursor-pointer">
                  {event.isPublished ? (
                    <Badge variant="default">公開中</Badge>
                  ) : (
                    <Badge variant="secondary">非公開</Badge>
                  )}
                </Label>
              </div>

              <div className="flex-1 max-w-lg space-y-1.5">
                <Label className="text-xs text-gray-500">公開URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={publicUrl}
                    className="text-xs bg-gray-50"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(publicUrl)}
                    title="URLをコピー"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(publicUrl, "_blank")}
                    title="別タブで開く"
                  >
                    <ExternalLink className="size-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">QRコード</Label>
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  <QrCode className="size-10 text-gray-300" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============================================================
            セクション2: 配置図アップロード
         ============================================================ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="size-4 text-primary" />
              配置図アップロード
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleImageUpload}
            />

            {!mapImage ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 py-16 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <ImageIcon className="size-10 text-gray-300" />
                <span className="text-sm text-gray-500">
                  クリックして配置図をアップロード
                </span>
                <span className="text-xs text-gray-400">
                  対応形式: JPG / PNG
                </span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mapImage}
                    alt="配置図プレビュー"
                    className="w-full object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-3.5 mr-1" />
                    画像を変更
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setMapImage(null)}
                  >
                    <Trash2 className="size-3.5 mr-1" />
                    削除
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============================================================
            セクション3: 地点管理
         ============================================================ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPinIcon className="size-4 text-primary" />
              地点管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              {/* マップエリア */}
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">
                  配置図をクリックしてピンを追加
                </Label>
                <div
                  ref={mapContainerRef}
                  onClick={handleMapClick}
                  className="relative cursor-crosshair overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-100"
                  style={{ minHeight: 320 }}
                >
                  {mapImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mapImage}
                        alt="配置図"
                        className="w-full select-none pointer-events-none"
                        draggable={false}
                      />
                      {pins.map((pin) => (
                        <button
                          key={pin.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPinId(pin.id);
                          }}
                          title={pin.name || "新しいピン"}
                          className="absolute -translate-x-1/2 -translate-y-full transition-transform hover:scale-125"
                          style={{
                            left: `${pin.x}%`,
                            top: `${pin.y}%`,
                          }}
                        >
                          <div className="relative">
                            <MapPinIcon
                              className="size-7 drop-shadow-md"
                              style={{ color: categoryColor(pin.category) }}
                              fill={
                                selectedPinId === pin.id
                                  ? categoryColor(pin.category)
                                  : "white"
                              }
                              strokeWidth={2}
                            />
                            {pin.shortName && (
                              <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900/80 px-1.5 py-0.5 text-[10px] text-white">
                                {pin.shortName}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="flex h-80 flex-col items-center justify-center gap-2 text-gray-400">
                      <ImageIcon className="size-12" />
                      <span className="text-sm">
                        先に配置図をアップロードしてください
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 編集フォーム */}
              <div>
                {selectedPin ? (
                  <div className="space-y-4 rounded-xl border bg-white p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">
                        ピン編集
                      </h3>
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => setSelectedPinId(null)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">名前</Label>
                        <Input
                          value={selectedPin.name}
                          onChange={(e) =>
                            setPins((prev) =>
                              prev.map((p) =>
                                p.id === selectedPin.id
                                  ? { ...p, name: e.target.value }
                                  : p
                              )
                            )
                          }
                          onBlur={() =>
                            handleUpdatePin(selectedPin.id, {
                              name: selectedPin.name,
                            })
                          }
                          placeholder="例: 総合受付"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">略称</Label>
                        <Input
                          value={selectedPin.shortName}
                          onChange={(e) =>
                            setPins((prev) =>
                              prev.map((p) =>
                                p.id === selectedPin.id
                                  ? { ...p, shortName: e.target.value }
                                  : p
                              )
                            )
                          }
                          onBlur={() =>
                            handleUpdatePin(selectedPin.id, {
                              shortName: selectedPin.shortName,
                            })
                          }
                          placeholder="例: 受付"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">カテゴリ</Label>
                        <select
                          value={selectedPin.category}
                          onChange={(e) =>
                            handleUpdatePin(selectedPin.id, {
                              category: e.target.value as PinCategory,
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {PIN_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">説明</Label>
                        <Textarea
                          value={selectedPin.description}
                          onChange={(e) =>
                            setPins((prev) =>
                              prev.map((p) =>
                                p.id === selectedPin.id
                                  ? { ...p, description: e.target.value }
                                  : p
                              )
                            )
                          }
                          onBlur={() =>
                            handleUpdatePin(selectedPin.id, {
                              description: selectedPin.description,
                            })
                          }
                          placeholder="この地点の説明"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">開催時間</Label>
                        <Input
                          value={selectedPin.openTime}
                          onChange={(e) =>
                            setPins((prev) =>
                              prev.map((p) =>
                                p.id === selectedPin.id
                                  ? { ...p, openTime: e.target.value }
                                  : p
                              )
                            )
                          }
                          onBlur={() =>
                            handleUpdatePin(selectedPin.id, {
                              openTime: selectedPin.openTime,
                            })
                          }
                          placeholder="例: 10:00〜15:00"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">注意事項</Label>
                        <Textarea
                          value={selectedPin.notes}
                          onChange={(e) =>
                            setPins((prev) =>
                              prev.map((p) =>
                                p.id === selectedPin.id
                                  ? { ...p, notes: e.target.value }
                                  : p
                              )
                            )
                          }
                          onBlur={() =>
                            handleUpdatePin(selectedPin.id, {
                              notes: selectedPin.notes,
                            })
                          }
                          placeholder="注意事項があれば記入"
                          rows={2}
                        />
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleDeletePin(selectedPin.id)}
                    >
                      <Trash2 className="size-3.5 mr-1" />
                      このピンを削除
                    </Button>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                    <MapPinIcon className="size-8 mb-2" />
                    <span className="text-sm">
                      ピンを選択すると
                      <br />
                      ここに編集フォームが表示されます
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ピン一覧 */}
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                ピン一覧（{pins.length}件）
              </h3>
              {pins.length === 0 ? (
                <p className="text-sm text-gray-400">
                  まだピンが追加されていません。
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-gray-500">
                        <th className="pb-2 pr-4 font-medium">名前</th>
                        <th className="pb-2 pr-4 font-medium">略称</th>
                        <th className="pb-2 pr-4 font-medium">カテゴリ</th>
                        <th className="pb-2 pr-4 font-medium">時間</th>
                        <th className="pb-2 font-medium text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pins.map((pin) => (
                        <tr
                          key={pin.id}
                          className={`border-b last:border-0 transition-colors ${
                            selectedPinId === pin.id
                              ? "bg-primary/5"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="py-2.5 pr-4 font-medium">
                            {pin.name || (
                              <span className="text-gray-300">未設定</span>
                            )}
                          </td>
                          <td className="py-2.5 pr-4 text-gray-600">
                            {pin.shortName || "—"}
                          </td>
                          <td className="py-2.5 pr-4">
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: categoryColor(pin.category),
                                color: categoryColor(pin.category),
                              }}
                            >
                              {pin.category}
                            </Badge>
                          </td>
                          <td className="py-2.5 pr-4 text-gray-600">
                            {pin.openTime || "—"}
                          </td>
                          <td className="py-2.5 text-right space-x-1">
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              onClick={() => setSelectedPinId(pin.id)}
                              title="編集"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeletePin(pin.id)}
                              title="削除"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ============================================================
            セクション4: お知らせ管理
         ============================================================ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="size-4 text-primary" />
              お知らせ管理
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border bg-gray-50/50 p-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                {editingAnnouncementId
                  ? "お知らせを編集"
                  : "新しいお知らせを追加"}
              </h3>
              <div className="grid gap-4 md:grid-cols-[140px_1fr]">
                <div className="space-y-1">
                  <Label className="text-xs">種別</Label>
                  <select
                    value={annForm.type}
                    onChange={(e) =>
                      setAnnForm((prev) => ({
                        ...prev,
                        type: e.target.value as AnnouncementType,
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {ANNOUNCEMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">タイトル</Label>
                  <Input
                    value={annForm.title}
                    onChange={(e) =>
                      setAnnForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="お知らせのタイトル"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">本文</Label>
                <Textarea
                  value={annForm.body}
                  onChange={(e) =>
                    setAnnForm((prev) => ({
                      ...prev,
                      body: e.target.value,
                    }))
                  }
                  placeholder="お知らせの内容を入力"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={saveAnnouncement}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="size-3.5 mr-1 animate-spin" />
                  ) : (
                    <Plus className="size-3.5 mr-1" />
                  )}
                  {editingAnnouncementId ? "更新" : "追加"}
                </Button>
                {editingAnnouncementId && (
                  <Button size="sm" variant="outline" onClick={resetAnnForm}>
                    キャンセル
                  </Button>
                )}
              </div>
            </div>

            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                登録済みお知らせ（{announcements.length}件）
              </h3>
              {announcements.length === 0 ? (
                <p className="text-sm text-gray-400">
                  まだお知らせが登録されていません。
                </p>
              ) : (
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className={`rounded-lg border p-4 transition-colors ${
                        editingAnnouncementId === ann.id
                          ? "border-primary/30 bg-primary/5"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={announcementBadgeVariant(ann.type)}
                              className="text-[10px]"
                            >
                              {ann.type}
                            </Badge>
                            <span className="font-medium text-sm text-gray-800 truncate">
                              {ann.title}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {ann.body}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => startEditAnnouncement(ann)}
                            title="編集"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            title="削除"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t bg-white px-6 py-4 text-center text-xs text-gray-400 md:px-10">
        マップ型情報共有システム — 管理者ダッシュボード
      </footer>
    </div>
  );
}
