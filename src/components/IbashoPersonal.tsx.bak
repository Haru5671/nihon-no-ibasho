"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function IbashoPersonal() {
  const [subStatus, setSubStatus] = useState<string>("loading");
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetch("/api/subscription/status")
      .then((res) => res.json())
      .then((data) => {
        setSubStatus(data.status);
        setPeriodEnd(data.currentPeriodEnd);
      })
      .catch(() => setSubStatus("inactive"));
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("決済ページの作成に失敗しました。");
        setLoading(false);
      }
    } catch {
      alert("エラーが発生しました。");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Hero card */}
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 border border-gray-200 rounded-xl p-6 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">いばしょパーソナル</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          会員限定の、より深くつながれるパーソナルな空間。
          <br className="hidden sm:block" />
          安心して本音を話せる場所がここにあります。
        </p>
      </div>

      {/* Subscription status (active members) */}
      {subStatus === "active" && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-sm font-medium text-teal-700">パーソナル会員</span>
          </div>
          <p className="text-xs text-teal-600">
            {periodEnd
              ? `次回更新日: ${new Date(periodEnd).toLocaleDateString("ja-JP")}`
              : "有効な会員ステータスです"}
          </p>
        </div>
      )}

      {/* Features */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500 shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-800 font-semibold text-sm mb-2">音声コミュニケーション</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-2">
                テキストでは伝わりにくいニュアンスや感情を、声を通じて共有できます。匿名のまま音声通話が可能で、顔出し不要。相手の声のトーンや間合いから、テキスト以上の安心感が生まれます。
              </p>
              <ul className="text-gray-500 text-xs leading-relaxed space-y-1">
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>1対1の音声通話（最大60分/回）</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>通話内容は録音・保存されません</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>事前予約制で、双方の同意のもとで開始</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>途中退出・キャンセルはいつでも自由</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500 shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-800 font-semibold text-sm mb-2">情報の秘匿化</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-2">
                パーソナルで共有された情報は、対話の当事者のみが閲覧できます。広場や小部屋には一切反映されず、第三者からはアクセスできません。より踏み込んだ話がしやすい環境を実現します。
              </p>
              <ul className="text-gray-500 text-xs leading-relaxed space-y-1">
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>メッセージは送信者がいつでも個別削除可能</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>対話終了後に全履歴を一括消去する機能あり</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>スクリーンショット防止の仕組みを導入予定</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>運営側もメッセージ内容を閲覧しません（通報時を除く）</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500 shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-800 font-semibold text-sm mb-2">運営による伴走サポート</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-2">
                希望するユーザーに対して、運営メンバーが対話の相手として伴走します。カウンセリングではなく、あくまで「一緒に考える」スタンス。具体的な行動のアイデア出しや、気持ちの整理を手伝います。
              </p>
              <ul className="text-gray-500 text-xs leading-relaxed space-y-1">
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>月2回まで運営メンバーとの対話セッション</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>テキスト・音声どちらでも対応可能</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>医療・法律等の専門的助言は行いません</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>必要に応じて専門機関の情報を案内します</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500 shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-800 font-semibold text-sm mb-2">個別対話</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-2">
                広場では話しにくい内容を、信頼できる相手と1対1で対話できます。マッチングは興味・悩みのカテゴリをもとに行われ、双方の同意がなければ対話は開始されません。
              </p>
              <ul className="text-gray-500 text-xs leading-relaxed space-y-1">
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>同時に持てる対話相手は最大3人まで</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>相手のブロック・通報はいつでも可能</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>個人情報の交換を求める行為は禁止</li>
                <li className="flex items-start gap-1.5"><span className="text-teal-500 mt-0.5">-</span>対話の頻度やペースは自分で自由に決められます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
        {subStatus === "active" ? (
          <>
            <p className="text-teal-600 text-sm font-medium mb-1">パーソナル会員として利用中です</p>
            <p className="text-gray-400 text-xs">
              {periodEnd
                ? `次回更新日: ${new Date(periodEnd).toLocaleDateString("ja-JP")}`
                : ""}
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-1">基本利用は無料。パーソナル機能のご利用には会員登録が必要です。</p>
            <p className="text-gray-400 text-xs mb-4">料金はお申し込み手続きの中でご確認いただけます。</p>
            <button
              onClick={handleSubscribe}
              disabled={loading || subStatus === "loading"}
              className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
            >
              {loading ? "処理中..." : "パーソナルに申し込む"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
