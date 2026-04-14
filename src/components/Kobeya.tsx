"use client";

import { useState, useEffect } from "react";
import { TOPICS, type Topic } from "@/data/posts";
import { createClient } from "@/lib/supabase/client";
import type { Room } from "@/components/KobeyaRoom";

const STATIC_ROOMS: Room[] = [
  { id: 1,  topic: "眠れない・不安",  name: "夜更かしの会",       desc: "眠れない夜に、ゆるくつながる部屋。",         members: 0 },
  { id: 2,  topic: "体・こころ",      name: "HSPのひといき",      desc: "繊細さを持つ人同士で、安心して話せる場。",   members: 0 },
  { id: 3,  topic: "孤独・さみしさ",  name: "在宅ワーカーの雑談", desc: "リモートワークの孤独を分かち合う。",         members: 0 },
  { id: 4,  topic: "なんでも",        name: "読書と内省",         desc: "本を通じて自分を見つめ直す部屋。",           members: 0 },
  { id: 5,  topic: "なんでも",        name: "散歩部",             desc: "今日歩いた道、見つけた景色をシェア。",       members: 0 },
  { id: 6,  topic: "なんでも",        name: "なんとなく話したい", desc: "テーマなし。ただ誰かと話したいときに。",     members: 0 },
  { id: 7,  topic: "仕事・AI",        name: "AIと仕事を語る",     desc: "AIへの不安や変化を、ここで吐き出してみて。", members: 0 },
  { id: 8,  topic: "家族・人間関係",  name: "家族のこと",         desc: "家族には言えない家族の話をする場所。",       members: 0 },
];

interface RoomMeta { activeCount: number; msgCount: number; }
interface KobeyaProps { onEnterRoom: (room: Room) => void; }
interface CreateForm { name: string; topic: Topic; description: string; }

export default function Kobeya({ onEnterRoom }: KobeyaProps) {
  const supabase = createClient();
  const [rooms, setRooms] = useState<Room[]>(STATIC_ROOMS);
  const [roomMeta, setRoomMeta] = useState<Record<number, RoomMeta>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>({ name: "", topic: "なんでも", description: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const getTopicMeta = (topic: Topic) => TOPICS.find((t) => t.id === topic) ?? TOPICS[TOPICS.length - 1];

  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data: { id: number; topic: Topic; name: string; description: string }[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const dbRooms: Room[] = data.map((r) => ({
          id: 10000 + r.id, topic: r.topic, name: r.name, desc: r.description ?? "", members: 0,
        }));
        setRooms([...dbRooms, ...STATIC_ROOMS]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function loadMsgCounts() {
      const updates: Record<number, RoomMeta> = {};
      await Promise.all(rooms.map(async (room) => {
        const { count } = await supabase
          .from("room_messages").select("*", { count: "exact", head: true }).eq("room_id", room.id);
        updates[room.id] = { activeCount: roomMeta[room.id]?.activeCount ?? 0, msgCount: count ?? 0 };
      }));
      setRoomMeta((prev) => ({ ...prev, ...updates }));
    }
    if (rooms.length > 0) loadMsgCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  useEffect(() => {
    const channels = rooms.map((room) => {
      const ch = supabase.channel(`presence_room_${room.id}`, {
        config: { presence: { key: `room_${room.id}` } },
      });
      ch.on("presence", { event: "sync" }, () => {
        const count = Object.keys(ch.presenceState()).length;
        setRoomMeta((prev) => ({ ...prev, [room.id]: { ...prev[room.id], activeCount: count } }));
      }).subscribe();
      return ch;
    });
    return () => { channels.forEach((ch) => supabase.removeChannel(ch)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  const handleCreate = async () => {
    if (!form.name.trim()) { setCreateError("部屋名を入力してください"); return; }
    setCreating(true);
    setCreateError("");
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { setCreateError("作成に失敗しました"); setCreating(false); return; }
    const newRoom = await res.json();
    const room: Room = { id: 10000 + newRoom.id, topic: form.topic, name: form.name, desc: form.description, members: 0 };
    setRooms((prev) => [room, ...prev]);
    setShowCreate(false);
    setForm({ name: "", topic: "なんでも", description: "" });
    setCreating(false);
    onEnterRoom(room);
  };

  return (
    <div>
      {/* Header row */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="font-headline font-bold text-[18px] text-on-surface mb-1">小部屋</h2>
          <p className="text-[13px] text-on-surface-variant leading-relaxed">
            テーマごとの小部屋。入室するとその話題に集中した会話ができます。
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="shrink-0 ml-4 flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary text-[13px] font-semibold rounded-full transition-all active:scale-95 shadow-card"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          部屋を作る
        </button>
      </div>

      {/* Create room form */}
      {showCreate && (
        <div className="bg-surface-container-lowest rounded-2xl shadow-card-hover p-6 mb-6 ring-2 ring-primary/20">
          <h3 className="font-headline font-bold text-[15px] text-on-surface mb-4">新しい部屋を作る</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant mb-1.5 block">部屋名 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="例：夜の読書部"
                maxLength={30}
                className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder-outline"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant mb-1.5 block">トピック</label>
              <div className="flex flex-wrap gap-1.5">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, topic: t.id }))}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      form.topic === t.id
                        ? "bg-primary text-on-primary"
                        : "bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim"
                    }`}
                  >
                    {t.id}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-on-surface-variant mb-1.5 block">説明（任意）</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="部屋の雰囲気や目的を一言で"
                maxLength={60}
                className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-primary transition-all text-on-surface placeholder-outline"
              />
            </div>
            {createError && <p className="text-[12px] text-error">{createError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={creating || !form.name.trim()}
                className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-on-primary text-[13px] font-bold rounded-full transition-all disabled:opacity-40"
              >
                {creating ? "作成中..." : "作成して入室"}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-5 py-2.5 bg-surface-container text-on-surface-variant text-[13px] rounded-full hover:bg-surface-container-high transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rooms.map((room) => {
          const m = getTopicMeta(room.topic);
          const meta = roomMeta[room.id];
          const activeCount = meta?.activeCount ?? 0;
          const msgCount = meta?.msgCount ?? 0;

          return (
            <div
              key={room.id}
              onClick={() => onEnterRoom(room)}
              className="group bg-surface-container-lowest rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col"
            >
              {/* Topic + NEW badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${m.color}`}>
                  {m.emoji} {room.topic}
                </span>
                {room.id >= 10000 && (
                  <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-semibold">NEW</span>
                )}
              </div>

              {/* Name + desc */}
              <h3 className="font-headline font-bold text-[15px] text-on-surface mb-1.5">{room.name}</h3>
              <p className="text-[12px] text-on-surface-variant leading-relaxed flex-1 mb-4">{room.desc}</p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px]">
                  {/* Active indicator */}
                  <span className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeCount > 0 ? "bg-primary-container" : "bg-outline-variant"}`} />
                    {activeCount > 0 ? `${activeCount}人いる` : "誰もいない"}
                  </span>
                  {msgCount > 0 && (
                    <span className="flex items-center gap-1 text-outline">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {msgCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onEnterRoom(room); }}
                  className="px-4 py-1.5 text-[12px] font-semibold rounded-full bg-surface-container group-hover:bg-primary group-hover:text-on-primary text-on-surface transition-all"
                >
                  入る
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
