"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
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

interface PresenceUser {
  userId: string;
  displayName: string;
  joinedAt: number;
}

interface KobeyaRoomProps {
  room: Room;
  onLeave: () => void;
}

interface PeerState {
  conn: RTCPeerConnection;
  stream?: MediaStream;
  displayName: string;
}

function timeLabel(ts: string) {
  return new Date(ts).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

const MAX_VOICE_USERS = 6;

export default function KobeyaRoom({ room, onLeave }: KobeyaRoomProps) {
  const topicMeta = TOPICS.find((t) => t.id === room.topic) ?? TOPICS[TOPICS.length - 1];
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const chatChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Current user
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const myPresenceId = useRef(Math.random().toString(36).slice(2, 8));

  // Voice chat
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceUsers, setVoiceUsers] = useState<{ id: string; name: string }[]>([]);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [voicePermDenied, setVoicePermDenied] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, PeerState>>(new Map());
  const audioElemsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const voiceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        const name = u.user_metadata?.display_name ?? u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? 'ゲスト';
        setCurrentUser({ id: u.id, name });
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

  // Realtime chat via Broadcast (postgres_changes requires publication setup; broadcast works without it)
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

  // Presence — subscribe once on room enter, update track when user loads
  useEffect(() => {
    const ch = supabase.channel(`presence_room_${room.id}`, {
      config: { presence: { key: myPresenceId.current } },
    });
    presenceChannelRef.current = ch;

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState<PresenceUser>();
      const users: PresenceUser[] = [];
      Object.values(state).forEach((entries) => entries.forEach((e) => users.push(e)));
      setActiveUsers(users);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({
          userId: myPresenceId.current,
          displayName: 'にんげんさん',
          joinedAt: Date.now(),
        });
      }
    });

    return () => {
      supabase.removeChannel(ch);
      presenceChannelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  // Update presence display name once user info loads
  useEffect(() => {
    if (!currentUser || !presenceChannelRef.current) return;
    presenceChannelRef.current.track({
      userId: myPresenceId.current,
      displayName: currentUser.name,
      joinedAt: Date.now(),
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

    // Optimistic update so sender sees message immediately
    const tempId = -Date.now();
    const optimistic: Message = { id: tempId, room_id: room.id, body: text, name, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);

    const { data } = await supabase.from('room_messages').insert({ room_id: room.id, body: text, name }).select().single();
    if (data) {
      setMessages((prev) => prev.map((m) => m.id === tempId ? (data as Message) : m));
      chatChannelRef.current?.send({ type: 'broadcast', event: 'new_message', payload: data });
    }
  };

  // ---- Voice Chat (WebRTC) ----
  const createPeerConnection = useCallback((peerId: string, peerName: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
      ],
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));
    }

    pc.ontrack = (e) => {
      const audio = audioElemsRef.current.get(peerId) ?? new Audio();
      audio.srcObject = e.streams[0];
      audio.play().catch(() => {});
      audioElemsRef.current.set(peerId, audio);
    };

    pc.onicecandidate = (e) => {
      if (e.candidate && voiceChannelRef.current) {
        voiceChannelRef.current.send({
          type: 'broadcast', event: 'ice',
          payload: { to: peerId, from: myPresenceId.current, candidate: e.candidate },
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        peersRef.current.delete(peerId);
        setVoiceUsers((prev) => prev.filter((u) => u.id !== peerId));
      }
    };

    peersRef.current.set(peerId, { conn: pc, displayName: peerName });
    return pc;
  }, []);

  const joinVoice = async () => {
    setVoiceError('');
    setVoicePermDenied(false);

    if (!currentUser) {
      setVoiceError('ボイスチャットにはログインが必要です');
      return;
    }

    // Check current voice user count
    if (voiceUsers.length >= MAX_VOICE_USERS) {
      setVoiceError(`ボイスチャットは最大${MAX_VOICE_USERS}人までです`);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      const channel = supabase.channel(`voice_${room.id}`, {
        config: { broadcast: { self: false } },
      });
      voiceChannelRef.current = channel;

      const myId = myPresenceId.current;
      const myName = currentUser.name;

      channel
        .on('broadcast', { event: 'voice_join' }, async ({ payload }) => {
          if (payload.from === myId) return;
          const peerId: string = payload.from;
          const peerName: string = payload.name ?? 'ゲスト';
          setVoiceUsers((prev) => {
            if (prev.some((u) => u.id === peerId)) return prev;
            if (prev.length >= MAX_VOICE_USERS) return prev;
            return [...prev, { id: peerId, name: peerName }];
          });
          const pc = createPeerConnection(peerId, peerName);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          channel.send({ type: 'broadcast', event: 'voice_offer',
            payload: { to: peerId, from: myId, fromName: myName, sdp: offer } });
        })
        .on('broadcast', { event: 'voice_offer' }, async ({ payload }) => {
          if (payload.to !== myId) return;
          const peerId: string = payload.from;
          const peerName: string = payload.fromName ?? 'ゲスト';
          setVoiceUsers((prev) => {
            if (prev.some((u) => u.id === peerId)) return prev;
            if (prev.length >= MAX_VOICE_USERS) return prev;
            return [...prev, { id: peerId, name: peerName }];
          });
          const pc = createPeerConnection(peerId, peerName);
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          channel.send({ type: 'broadcast', event: 'voice_answer',
            payload: { to: peerId, from: myId, sdp: answer } });
        })
        .on('broadcast', { event: 'voice_answer' }, async ({ payload }) => {
          if (payload.to !== myId) return;
          const peer = peersRef.current.get(payload.from);
          if (peer) await peer.conn.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        })
        .on('broadcast', { event: 'ice' }, async ({ payload }) => {
          if (payload.to !== myId) return;
          const peer = peersRef.current.get(payload.from);
          if (peer) await peer.conn.addIceCandidate(new RTCIceCandidate(payload.candidate));
        })
        .on('broadcast', { event: 'voice_leave' }, ({ payload }) => {
          const peerId: string = payload.from;
          peersRef.current.get(peerId)?.conn.close();
          peersRef.current.delete(peerId);
          audioElemsRef.current.delete(peerId);
          setVoiceUsers((prev) => prev.filter((u) => u.id !== peerId));
        })
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED') return;
          setVoiceUsers([{ id: myId, name: myName }]);
          channel.send({ type: 'broadcast', event: 'voice_join',
            payload: { from: myId, name: myName } });
        });

      setVoiceActive(true);
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setVoicePermDenied(true);
      } else if (name === 'NotFoundError') {
        setVoiceError('マイクが見つかりません。接続を確認してください。');
      } else {
        setVoiceError('マイクを起動できませんでした。');
      }
    }
  };

  const leaveVoice = useCallback(() => {
    if (voiceChannelRef.current) {
      voiceChannelRef.current.send({
        type: 'broadcast', event: 'voice_leave',
        payload: { from: myPresenceId.current },
      });
      supabase.removeChannel(voiceChannelRef.current);
      voiceChannelRef.current = null;
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    Array.from(peersRef.current.values()).forEach(({ conn }) => conn.close());
    peersRef.current.clear();
    Array.from(audioElemsRef.current.values()).forEach((a) => { a.srcObject = null; });
    audioElemsRef.current.clear();
    setVoiceActive(false);
    setVoiceUsers([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leaveVoiceRef = useRef(leaveVoice);
  leaveVoiceRef.current = leaveVoice;
  useEffect(() => () => { leaveVoiceRef.current(); }, []);

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = voiceMuted; });
    setVoiceMuted(!voiceMuted);
  };

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

        {/* Active users list */}
        {activeUsers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {activeUsers.map((u) => (
              <span key={u.userId} className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                {u.displayName}
              </span>
            ))}
          </div>
        )}

        {/* Voice chat */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          {voicePermDenied ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-2">
              <p className="text-[12px] font-semibold text-red-600 mb-1">🎙️ マイクへのアクセスが拒否されています</p>
              <p className="text-[11px] text-red-500 leading-relaxed mb-2">
                ブラウザの設定でマイクを許可してから、もう一度お試しください。
              </p>
              <div className="text-[11px] text-gray-500 space-y-0.5 mb-3">
                <p className="font-medium text-gray-600">設定方法：</p>
                <p>📱 <span className="font-medium">Safari（iOS）</span>：設定アプリ → Safari → マイク → ibasho.co.jp を許可</p>
                <p>🖥️ <span className="font-medium">Chrome</span>：アドレスバーの 🔒 → マイク → 許可</p>
                <p>🦊 <span className="font-medium">Firefox</span>：アドレスバーの 🔒 → マイクのアクセス許可 → 許可</p>
              </div>
              <button
                onClick={joinVoice}
                className="text-[12px] px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                もう一度試す
              </button>
            </div>
          ) : null}
          {voiceError && (
            <div className="mb-2 text-[11px] text-red-500 flex items-center gap-1">
              <span>⚠️</span> {voiceError}
              {!currentUser && (
                <Link href="/auth/login" className="underline text-teal-600 ml-1">ログイン</Link>
              )}
            </div>
          )}
          {!voiceActive && !voicePermDenied ? (
            <div className="flex items-center gap-2">
              <button
                onClick={joinVoice}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-[12px] font-semibold rounded-lg transition-colors"
              >
                🎤 ボイス参加
              </button>
              {!currentUser && (
                <span className="text-[11px] text-gray-400">※ ログインが必要です</span>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 text-violet-700 text-[12px] font-semibold rounded-lg">
                  <span className="animate-pulse">🔴</span> ライブ中
                </div>
                <button
                  onClick={toggleMute}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium rounded-lg border transition-colors ${
                    voiceMuted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {voiceMuted ? '🔇 ミュート' : '🔊 発話中'}
                </button>
                <button
                  onClick={leaveVoice}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[12px] font-medium rounded-lg transition-colors"
                >
                  退出
                </button>
              </div>
              {/* Voice participants */}
              <div className="flex flex-wrap gap-1.5">
                {voiceUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-1 text-[11px] px-2 py-1 bg-violet-50 text-violet-700 rounded-full border border-violet-200">
                    <span className="text-[9px]">{u.id === myPresenceId.current ? (voiceMuted ? '🔇' : '🎤') : '🔊'}</span>
                    {u.name}
                    {u.id === myPresenceId.current && <span className="text-[9px] text-violet-400">(自分)</span>}
                  </div>
                ))}
              </div>
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
                  {isMe ? `${timeLabel(msg.created_at)}` : `${msg.name} · ${timeLabel(msg.created_at)}`}
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
