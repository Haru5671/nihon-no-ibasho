import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "利用規約 — にほんのいばしょ",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f8fafb] min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 mb-8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            トップに戻る
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">利用規約</h1>
          <p className="text-sm text-gray-400 mb-10">最終更新日：2026年4月5日</p>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-8 text-sm leading-relaxed text-gray-700">

            <p>にほんのいばしょ（以下「本サービス」）をご利用いただくにあたり、以下の利用規約（以下「本規約」）をお読みください。本サービスを利用することで、本規約に同意したものとみなします。</p>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">第1条（サービスの概要）</h2>
              <p>本サービスは、AI時代における人間同士のつながりと対話を目的とした匿名コミュニティプラットフォームです。登録不要・無料でご利用いただけます。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">第2条（唯一のルール：悪口禁止）</h2>
              <p className="mb-3">本サービスには、ひとつだけルールがあります。</p>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center">
                <p className="text-teal-800 font-bold text-base">悪口禁止</p>
                <p className="text-teal-600 text-xs mt-1">本サービスは同調と対話の場です</p>
              </div>
              <p className="mt-3">特定の個人・団体・属性を傷つける目的の投稿、誹謗中傷、差別的表現を含む投稿は禁止します。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">第3条（禁止事項）</h2>
              <p className="mb-2">以下の行為を禁止します。</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                <li>特定の個人・団体に対する誹謗中傷・名誉毀損</li>
                <li>差別的・ヘイトスピーチにあたる表現</li>
                <li>個人情報（氏名・住所・電話番号・顔写真等）の投稿・収集</li>
                <li>スパム・広告・宣伝目的の投稿</li>
                <li>著作権・商標権・プライバシー権等の第三者の権利を侵害する行為</li>
                <li>法令に違反する行為または違反を促す行為</li>
                <li>本サービスのシステムへの不正アクセス・クローリング・スクレイピング</li>
                <li>他のユーザーへの嫌がらせ・ストーキング行為</li>
                <li>自殺・自傷行為を推奨・誘発する表現</li>
                <li>その他、運営が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">第4条（投稿コンテンツ）</h2>
              <div className="space-y-3">
                <p>ユーザーが投稿したコンテンツ（テキスト等）の著作権は、投稿者に帰属します。ただし、ユーザーは本サービスの運営に必要な範囲（表示・統計処理・サービス改善等）において、当該コンテンツを無償で利用することを許諾するものとします。</p>
                <p>投稿コンテンツが第三者の権利を侵害している場合、または本規約に違反していると判断した場合、運営は事前通知なく当該コンテンツを削除することができます。</p>
                <p>本サービスは匿名コミュニティです。投稿内容は不特定多数のユーザーに公開されることをご理解ください。</p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">第5条（免責事項）</h2>
              <div className="space-y-3">
                <p>本サービスは、ユーザーの投稿内容の正確性・完全性・有用性を保証しません。投稿内容に基づいて行動された結果について、運営は一切の責任を負いません。</p>
                <p>本サービスは精神的なサポートを目的としていますが、医療・法律・財務等の専門的なアドバイスに代わるものではありません。専門的な支援が必要な場合は、医療機関・専門家にご相談ください。</p>
                <p>運営は、サービスの中断・停止・終了、データの消失、システム障害等によって生じた損害について、一切の責任を負いません。</p>
                <p>ユーザー間のトラブルについて、運営は一切関与せず、責任を負いません。</p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">第6条（サービスの変更・停止）</h2>
              <p>運営は、予告なくサービス内容の変更・機能の追加削除・サービスの停止・終了を行うことができます。これによってユーザーに生じた損害について、運営は責任を負いません。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">第7条（広告）</h2>
              <p>本サービスでは、Google AdSense 等の第三者広告サービスを利用することがあります。広告内容については、各広告主の責任に帰属し、運営は広告の内容・正確性について保証しません。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">第8条（規約の変更）</h2>
              <p>運営は、必要に応じて本規約を変更することができます。変更後も本サービスをご利用いただいた場合、変更後の規約に同意したものとみなします。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">第9条（準拠法・管轄）</h2>
              <p>本規約は日本法に準拠するものとし、本サービスに関する紛争については、運営所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">第10条（お問い合わせ）</h2>
              <p>本規約に関するご質問は、本サービス内のお問い合わせフォームよりご連絡ください。</p>
              <p className="mt-2 text-gray-500">運営：にほんのいばしょ</p>
            </section>

          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            プライバシーポリシーは
            <Link href="/privacy" className="text-teal-600 hover:underline mx-1">こちら</Link>
            をご覧ください。
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
