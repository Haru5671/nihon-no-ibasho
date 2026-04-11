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

interface RoomMeta {
  activeCount: number;
  msgCount: number;
}

interface KobeyaProps {
  onEnterRoom: (room: Room) => void;
}

interface CreateForm {
  name: string;
  topic: Topic;
  description: string;
}

export default function Kobeya({ onEnterRoom }: KobeyaProps) {
  const supabase = createClient();
  const [rooms, setRooms] = useState<Room[]>(STATIC_ROOMS);
  const [roomMeta, setRoomMeta] = useState<Record<number, RoomMeta>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>({ name: '', topic: 'なんでも', description: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const getTopicMeta = (topic: Topic) => TOPICS.find((t) => t.id === topic) ?? TOPICS[TOPICS.length - 1];

  // Load user-created rooms
  useEffect(() => {
    fetch('/api/rooms')
      .then((r) => r.json())
      .then((data: { id: number; topic: Topic; name: string; description: string }[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const dbRooms: Room[] = data.map((r) => ({
          id: 10000 + r.id,
          topic: r.topic,
          name: r.name,
          desc: r.description ?? '',
          members: 0,
        }));
        setRooms([...dbRooms, ...STATIC_ROOMS]);
      })
      .catch(() => {});
  }, []);

  // Load message counts for all rooms
  useEffect(() => {
    async function loadMsgCounts() {
      const allRooms = [...rooms];
      const updates: Record<number, RoomMeta> = {};
      await Promise.all(
        allRooms.map(async (room) => {
          const { count } = await supabase
            .from('room_messages')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id);
          updates[room.id] = { activeCount: roomMeta[room.id]?.activeCount ?? 0, msgCount: count ?? 0 };
        })
      );
      setRoomMeta((prev) => ({ ...prev, ...updates }));
    }
    if (rooms.length > 0) loadMsgCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  // Subscribe to presence for all rooms to count active users
  useEffect(() => {
    const channels = rooms.map((room) => {
      const ch = supabase.channel(`presence_room_${room.id}`, {
        config: { presence: { key: `room_${room.id}` } },
      });
      ch.on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState();
        const count = Object.keys(state).length;
        setRoomMeta((prev) => ({
          ...prev,
          [room.id]: { ...prev[room.id], activeCount: count },
        }));
      }).subscribe();
      return ch;
    });
    return () => { channels.forEach((ch) => supabase.removeChannel(ch)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms]);

  const handleCreate = async () => {
    if (!form.name.trim()) { setCreateError('部屋名を入力してください'); return; }
    setCreating(true);
    setCreateError('');
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setCreateError('作成に失敗しました');
      setCreating(false);
      return;
    }
    const newRoom = await res.json();
    const room: Room = {
      id: 10000 + newRoom.id,
      topic: form.topic,
      name: form.name,
      desc: form.description,
      members: 0,
    };
    setRooms((prev) => [room, ...prev]);
    setShowCreate(false);
    setForm({ name: '', topic: 'なんでも', description: '' });
    setCreating(false);
    onEnterRoom(room);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-gray-400 leading-relaxed">
          テーマごとの小部屋です。入室するとその話題に集中した会話ができます。
        </p>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[12px] font-semibold rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          部屋を作る
        </button>
      </div>

      {/* Create room form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-teal-200 p-4 mb-4 shadow-sm">
          <h3 className="text-[14px] font-bold text-gray-800 mb-3">新しい部屋を作る</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">部屋名 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="例：夜の読書部"
                maxLength={30}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-teal-400 transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">トピック</label>
              <div className="flex flex-wrap gap-1.5">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setForm((f) => ({ ...f, topic: t.id }))}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors flex items-center gap-1 ${
                      form.topic === t.id ? t.color : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {t.emoji} {t.id}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] text-gray-500 mb-1 block">説明（任意）</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="部屋の雰囲気や目的を一言で"
                maxLength={60}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-teal-400 transition-colors"
              />
            </div>
            {createError && <p className="text-[11px] text-red-500">{createError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={creating || !form.name.trim()}
                className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white text-[13px] font-bold rounded-lg transition-colors disabled:opacity-40"
              >
                {creating ? '作成中...' : '作成して入室'}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-gray-200 text-gray-500 text-[13px] rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rooms.map((room) => {
          const m = getTopicMeta(room.topic);
          const meta = roomMeta[room.id];
          const activeCount = meta?.activeCount ?? 0;
          const msgCount = meta?.msgCount ?? 0;
          return (
            <div
              key={room.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 flex flex-col hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onEnterRoom(room)}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${m.color}`}>
                  {m.emoji} {room.topic}
                </span>
                {room.id >= 10000 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-teal-50 text-teal-600 rounded-full border border-teal-200 font-medium">NEW</span>
                )}
              </div>
              <h3 className="text-gray-900 font-bold text-[14px] mb-1">{room.name}</h3>
              <p className="text-gray-500 text-[12px] mb-4 flex-1 leading-relaxed">{room.desc}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-gray-500 flex items-center gap-1">
                    <span className={activeCount > 0 ? 'text-green-500' : 'text-gray-300'}>●</span>
                    {activeCount > 0 ? `${activeCount}人いる` : '誰もいない'}
                  </span>
                  {msgCount > 0 && (
                    <span className="text-gray-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {msgCount}件
                    </span>
                  )}
                </div>
                <button
                  className="px-3.5 py-1.5 text-[12px] font-semibold rounded-lg bg-gray-900 group-hover:bg-teal-600 text-white transition-colors"
                  onClick={(e) => { e.stopPropagation(); onEnterRoom(room); }}
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
