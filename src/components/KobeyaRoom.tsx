"use client";

import { useState, useEffect, useRef } from "react";
import { TOPICS, type Topic } from "@/data/posts";
import { createClient } from "@/lib/supabase/client";


export interface Room {
  id: number;
  topic: Topic;
  name: string;
  desc: string;
  members: number;
}

interface Message {
  id: number;
  room_id: number;
  body: string;
  name: string;
  created_at: string;
}

// チャット上に表示するアイテム（メッセージ or システム通知）
type ChatItem =
  | (Message & { itemType: 'message' })
  | { itemType: 'system'; id: string; body: string; created_at: string };

interface ActiveUser {
  id: string;
  name: string;
}

interface KobeyaRoomProps {
  room: Room;
  onLeave: () => void;
}

function timeLabel(ts: string) {
  return new Date(ts).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

function dateTimeLabel(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `今日 ${time}`;
  if (isYesterday) return `昨日 ${time}`;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${time}`;
}

// 前のアイテムから30分以上離れていたらタイムスタンプ区切りを表示
function shouldShowTimestamp(items: ChatItem[], index: number): boolean {
  if (index === 0) return true;
  const prev = items[index - 1];
  const curr = items[index];
  const diff = new Date(curr.created_at).getTime() - new Date(prev.created_at).getTime();
  return diff > 30 * 60 * 1000;
}

export default function KobeyaRoom({ room, onLeave }: KobeyaRoomProps) {
  const topicMeta = TOPICS.find((t) => t.id === room.topic) ?? TOPICS[TOPICS.length - 1];
  const supabase = createClient();

  const [chatItems, setChatItems] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const myPresenceId = useRef(`u_${Math.random().toString(36).slice(2, 10)}`);
  const displayNameRef = useRef('にんげんさん');

  function addSystemItem(body: string) {
    const item: ChatItem = {
      itemType: 'system',
      id: `sys_${Date.now()}_${Math.random()}`,
      body,
      created_at: new Date().toISOString(),
    };
    setChatItems((prev) => [...prev, item]);
  }

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        const name = u.user_metadata?.display_name ?? u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? 'ゲスト';
        setCurrentUser({ id: u.id, name });
        displayNameRef.current = name;
      }
    });
  }, []);

  // Load messages
  useEffect(() => {
    supabase
      .from('room_messages')
      .select('*')
      .eq('room_id', room.id)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data) {
          setChatItems((data as Message[]).map((m) => ({ ...m, itemType: 'message' as const })));
        }
        setLoadingMsgs(false);
      });
  }, [room.id]);

  // Realtime chat via Broadcast
  useEffect(() => {
    const ch = supabase.channel(`chat_broadcast_${room.id}`, {
      config: { broadcast: { self: false } },
    })
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        setChatItems((prev) => {
          if (prev.some((m) => m.itemType === 'message' && m.id === payload.id)) return prev;
          return [...prev, { ...payload, itemType: 'message' as const }];
        });
      })
      .subscribe();
    chatChannelRef.current = ch;
    return () => {
      supabase.removeChannel(ch);
      chatChannelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  // Presence via Broadcast
  useEffect(() => {
    const myId = myPresenceId.current;
    const ch = supabase.channel(`room_presence_${room.id}`, {
      config: { broadcast: { self: false } },
    })
      .on('broadcast', { event: 'user_join' }, ({ payload }) => {
        setActiveUsers((prev) => {
          if (prev.some((u) => u.id === payload.id)) return prev;
          return [...prev, { id: payload.id, name: payload.name }];
        });
        addSystemItem(`${payload.name} が入室しました`);
        ch.send({ type: 'broadcast', event: 'user_here',
          payload: { id: myId, name: displayNameRef.current } });
      })
      .on('broadcast', { event: 'user_here' }, ({ payload }) => {
        setActiveUsers((prev) => {
          if (prev.some((u) => u.id === payload.id)) return prev;
          return [...prev, { id: payload.id, name: payload.name }];
        });
      })
      .on('broadcast', { event: 'user_leave' }, ({ payload }) => {
        setActiveUsers((prev) => {
          const user = prev.find((u) => u.id === payload.id);
          if (user) addSystemItem(`${user.name} が退出しました`);
          return prev.filter((u) => u.id !== payload.id);
        });
      })
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') return;
        const name = displayNameRef.current;
        setActiveUsers([{ id: myId, name }]);
        addSystemItem(`${name} が入室しました`);
        ch.send({ type: 'broadcast', event: 'user_join',
          payload: { id: myId, name } });
      });
    presenceChannelRef.current = ch;
    return () => {
      try { ch.send({ type: 'broadcast', event: 'user_leave', payload: { id: myId } }); } catch { /* ok */ }
      supabase.removeChannel(ch);
      presenceChannelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  // Re-announce with real name once user info loads
  useEffect(() => {
    if (!currentUser) return;
    const myId = myPresenceId.current;
    displayNameRef.current = currentUser.name;
    setActiveUsers((prev) => prev.map((u) => u.id === myId ? { ...u, name: currentUser.name } : u));
    presenceChannelRef.current?.send({ type: 'broadcast', event: 'user_here',
      payload: { id: myId, name: currentUser.name } });
  }, [currentUser]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatItems]);

  const handlePost = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const name = currentUser?.name ?? 'にんげんさん';

    const tempId = -Date.now();
    const optimistic: ChatItem = {
      itemType: 'message',
      id: tempId,
      room_id: room.id,
      body: text,
      name,
      created_at: new Date().toISOString(),
    };
    setChatItems((prev) => [...prev, optimistic]);

    const { data } = await supabase.from('room_messages').insert({ room_id: room.id, body: text, name }).select().single();
    if (data) {
      setChatItems((prev) => prev.map((m) =>
        m.itemType === 'message' && m.id === tempId ? { ...data as Message, itemType: 'message' as const } : m
      ));
      chatChannelRef.current?.send({ type: 'broadcast', event: 'new_message', payload: data });
    }
  };

  const myName = currentUser?.name ?? 'にんげんさん';

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* Room header */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-card p-4 mb-3">
        <div className="flex items-start gap-3">
          <button onClick={onLeave} className="shrink-0 mt-0.5 flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden focusable="false">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            部屋一覧
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${topicMeta.color}`}>
                {topicMeta.emoji} {room.topic}
              </span>
              <h1 className="text-base font-bold text-on-surface font-headline">{room.name}</h1>
            </div>
            <p className="text-sm text-on-surface-variant mt-1">{room.desc}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs text-on-surface-variant flex items-center gap-1 justify-end">
              <span className={activeUsers.length > 0 ? 'text-primary' : 'text-outline'}>●</span>
              {activeUsers.length}人いる
            </div>
          </div>
        </div>

        {/* Active users */}
        {activeUsers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {activeUsers.map((u) => (
              <span
                key={u.id}
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                  u.id === myPresenceId.current
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant'
                }`}
              >
                {u.name}{u.id === myPresenceId.current ? ' (自分)' : ''}
              </span>
            ))}
          </div>
        )}

        {/* Voice chat - coming soon */}
        <div className="mt-3 pt-3 border-t border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm text-on-surface-variant">
              🎤 ボイスチャット
            </span>
            <span className="text-xs px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed rounded-full font-medium">近日公開</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 mb-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 420px)' }}>
        {loadingMsgs && <div className="text-center py-8 text-on-surface-variant text-sm">読み込み中...</div>}
        {!loadingMsgs && chatItems.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant text-sm">
            まだ誰も話していません。最初に話しかけてみませんか？
          </div>
        )}

        {chatItems.map((item, index) => {
          const showTs = shouldShowTimestamp(chatItems, index);

          if (item.itemType === 'system') {
            return (
              <div key={item.id}>
                {showTs && (
                  <div className="text-center py-2">
                    <span className="text-xs text-on-surface-variant">{dateTimeLabel(item.created_at)}</span>
                  </div>
                )}
                <div className="flex justify-center my-1">
                  <span className="text-xs text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
                    {item.body}
                  </span>
                </div>
              </div>
            );
          }

          const isMe = item.name === myName;
          return (
            <div key={item.id}>
              {showTs && (
                <div className="text-center py-2">
                  <span className="text-xs text-on-surface-variant">{dateTimeLabel(item.created_at)}</span>
                </div>
              )}
              <div className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isMe ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant"
                }`}>
                  {item.name?.[0] ?? "に"}
                </div>
                <div className={`max-w-[78%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <span className="text-xs text-on-surface-variant px-1">
                    {isMe ? timeLabel(item.created_at) : `${item.name} · ${timeLabel(item.created_at)}`}
                  </span>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-[15px] leading-relaxed ${
                    isMe
                      ? "bg-primary text-on-primary rounded-tr-sm"
                      : "bg-surface-container-lowest text-on-surface rounded-tl-sm shadow-card"
                  }`}>
                    {item.body}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-4">
        <div className="bg-surface-container-lowest rounded-2xl shadow-float p-3 flex gap-2 items-end">
          <label htmlFor="room-input" className="sr-only">メッセージ</label>
          <textarea
            id="room-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${room.name}に話しかける...`}
            className="flex-1 bg-transparent text-on-surface placeholder-outline resize-none outline-none text-[15px] leading-relaxed"
            rows={2}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost(); }}
          />
          <button
            onClick={handlePost}
            disabled={!input.trim()}
            aria-label="送信"
            className="shrink-0 w-11 h-11 rounded-xl bg-primary hover:bg-primary/90 text-on-primary flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden focusable="false">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-on-surface-variant mt-1.5">⌘+Enter で送信</p>
      </div>
    </div>
  );
}
