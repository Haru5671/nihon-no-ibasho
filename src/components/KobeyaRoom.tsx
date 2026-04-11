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

export default function KobeyaRoom({ room, onLeave }: KobeyaRoomProps) {
  const topicMeta = TOPICS.find((t) => t.id === room.topic) ?? TOPICS[TOPICS.length - 1];
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [voiceActive, setVoiceActive] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Stable refs to avoid stale closures
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const myPresenceId = useRef(`u_${Math.random().toString(36).slice(2, 10)}`);
  const displayNameRef = useRef('にんげんさん');

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
        if (data) setMessages(data as Message[]);
        setLoadingMsgs(false);
      });
  }, [room.id]);

  // Realtime chat via Broadcast
  useEffect(() => {
    const ch = supabase.channel(`chat_broadcast_${room.id}`, {
      config: { broadcast: { self: false } },
    })
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [...prev, payload as Message];
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

  // Presence via Broadcast — reliable alternative to Supabase Presence
  // Protocol:
  //   user_join  → broadcaster announces they joined; others respond with user_here
  //   user_here  → response to user_join; announces existing presence to newcomers
  //   user_leave → broadcaster announces they left
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
        // Let the newcomer know we exist (use ref to get current name)
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
        setActiveUsers((prev) => prev.filter((u) => u.id !== payload.id));
      })
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') return;
        // Add self immediately (self: false means we won't receive our own join)
        setActiveUsers([{ id: myId, name: displayNameRef.current }]);
        // Announce to others
        ch.send({ type: 'broadcast', event: 'user_join',
          payload: { id: myId, name: displayNameRef.current } });
      });

    presenceChannelRef.current = ch;

    return () => {
      try {
        ch.send({ type: 'broadcast', event: 'user_leave', payload: { id: myId } });
      } catch { /* channel may already be closing */ }
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
    presenceChannelRef.current?.send({
      type: 'broadcast', event: 'user_here',
      payload: { id: myId, name: currentUser.name },
    });
  }, [currentUser]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePost = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const name = currentUser?.name ?? 'にんげんさん';

    const tempId = -Date.now();
    const optimistic: Message = { id: tempId, room_id: room.id, body: text, name, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);

    const { data } = await supabase.from('room_messages').insert({ room_id: room.id, body: text, name }).select().single();
    if (data) {
      setMessages((prev) => prev.map((m) => m.id === tempId ? (data as Message) : m));
      chatChannelRef.current?.send({ type: 'broadcast', event: 'new_message', payload: data });
    }
  };

  const jitsiSrc = `https://meet.jit.si/ibasho-kobeya-${room.id}#config.startWithVideoMuted=true&config.prejoinPageEnabled=false&config.disableVideo=true&config.startAudioOnly=true&userInfo.displayName=${encodeURIComponent(currentUser?.name ?? 'にんげんさん')}`;

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* Room header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-3">
        <div className="flex items-start gap-3">
          <button onClick={onLeave} className="shrink-0 mt-0.5 flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-700 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            部屋一覧
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${topicMeta.color}`}>
                {topicMeta.emoji} {room.topic}
              </span>
              <h2 className="text-[15px] font-bold text-gray-900">{room.name}</h2>
            </div>
            <p className="text-[12px] text-gray-500 mt-1">{room.desc}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[11px] text-gray-500 flex items-center gap-1 justify-end">
              <span className={activeUsers.length > 0 ? 'text-green-500' : 'text-gray-300'}>●</span>
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
                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                  u.id === myPresenceId.current
                    ? 'bg-teal-50 text-teal-600 border-teal-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {u.name}{u.id === myPresenceId.current ? ' (自分)' : ''}
              </span>
            ))}
          </div>
        )}

        {/* Voice chat via Jitsi Meet */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          {!voiceActive ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoiceActive(true)}
                disabled={!currentUser}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-lg transition-colors"
              >
                🎤 ボイス参加
              </button>
              {!currentUser && (
                <span className="text-[11px] text-gray-400">※ ログインが必要です</span>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-violet-700">
                  <span className="animate-pulse">🔴</span> 音声通話中
                </div>
                <button
                  onClick={() => setVoiceActive(false)}
                  className="text-[11px] text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded"
                >
                  退出
                </button>
              </div>
              <iframe
                src={jitsiSrc}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                style={{ width: '100%', height: '260px', border: 'none', borderRadius: '12px' }}
                title="音声通話"
              />
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                🎤 マイクボタンでミュート切替 · 電話ボタンで退出
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-2 mb-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 420px)' }}>
        {loadingMsgs && <div className="text-center py-8 text-gray-400 text-sm">読み込み中...</div>}
        {!loadingMsgs && messages.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            まだ誰も話していません。最初に話しかけてみませんか？
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.name === (currentUser?.name ?? 'にんげんさん');
          return (
            <div key={msg.id} className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
              <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                isMe ? "bg-teal-100 text-teal-600" : "bg-gray-100 text-gray-500"
              }`}>
                {msg.name[0]}
              </div>
              <div className={`max-w-[78%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <span className="text-[11px] text-gray-400 px-1">
                  {isMe ? timeLabel(msg.created_at) : `${msg.name} · ${timeLabel(msg.created_at)}`}
                </span>
                <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                  isMe
                    ? "bg-teal-600 text-white rounded-tr-sm"
                    : "bg-white border border-gray-200 text-gray-700 rounded-tl-sm shadow-sm"
                }`}>
                  {msg.body}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-3 flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${room.name}に話しかける...`}
            className="flex-1 bg-transparent text-gray-700 placeholder-gray-300 resize-none outline-none text-[13px] leading-relaxed"
            rows={2}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost(); }}
          />
          <button
            onClick={handlePost}
            disabled={!input.trim()}
            className="shrink-0 w-8 h-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-300 mt-1.5">⌘+Enter で送信</p>
      </div>
    </div>
  );
}
