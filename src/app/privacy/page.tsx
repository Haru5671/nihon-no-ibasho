import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "プライバシーポリシー — にほんのいばしょ",
};

export default function PrivacyPage() {
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

          <h1 className="text-2xl font-bold text-gray-900 mb-2">プライバシーポリシー</h1>
          <p className="text-sm text-gray-400 mb-10">最終更新日：2026年4月5日</p>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-8 text-sm leading-relaxed text-gray-700">

            <p>にほんのいばしょ（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の適切な保護に努めます。本ポリシーは、本サービスにおける個人情報の取り扱いについて定めるものです。</p>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">1. 収集する情報</h2>
              <p className="mb-3">本サービスは、登録不要・完全匿名で利用できます。以下の情報を収集することがあります。</p>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-800 mb-1">（1）ユーザーが任意に提供する情報</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                    <li>投稿テキスト（匿名で処理され、個人を特定しません）</li>
                    <li>メールアドレス（アカウント登録機能を利用する場合のみ・任意）</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">（2）自動的に収集される情報</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                    <li>アクセスログ（IPアドレス、ブラウザ種別、OS、参照URL、アクセス日時）</li>
                    <li>Cookie および類似技術による情報</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">2. 情報の利用目的</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                <li>本サービスの提供・運営・改善</li>
                <li>不正利用・スパム・規約違反行為の防止</li>
                <li>お問い合わせへの対応</li>
                <li>利用状況の統計分析（個人を特定しない形式）</li>
              </ul>
              <p className="mt-3 text-gray-600">収集した情報を、上記目的以外で利用することはありません。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">3. 第三者提供</h2>
              <p className="mb-2">以下の場合を除き、ユーザーの情報を第三者に提供しません。</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                <li>ユーザーの同意がある場合</li>
                <li>法令に基づく開示請求があった場合</li>
                <li>人の生命・身体・財産の保護のために必要であり、本人の同意を得ることが困難な場合</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">4. 広告配信</h2>
              <p className="mb-3">現在、本サービスは広告を配信していません。将来、Google LLC が提供する広告配信サービス「Google AdSense」等の第三者広告サービスを利用することがあります。その場合、ユーザーの本サービスおよび他サイトへの過去のアクセス情報に基づいて、最適化された広告を表示するために Cookie を使用することがあります。</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                <li>
                  Google によるデータ利用について：
                  <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline ml-1">
                    Google のサービスを使用するサイトやアプリから収集した情報の利用
                  </a>
                </li>
                <li>
                  Cookie の無効化（オプトアウト）：
                  <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline ml-1">
                    広告設定ページ
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">5. Cookie について</h2>
              <p className="mb-2">本サービスは、利便性の向上・サービス改善・広告配信の最適化のため Cookie を使用します。ブラウザの設定から Cookie を無効にすることができますが、一部機能が正常に動作しなくなる場合があります。</p>
              <p>Cookie は個人を特定する情報を含まず、ユーザーのデバイスを識別するための識別子です。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">6. アクセス解析</h2>
              <p>本サービスでは、サービス改善を目的としてアクセス解析ツールを使用することがあります。収集されるデータは統計的に処理され、個人を特定するものではありません。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">7. セキュリティ</h2>
              <p>収集した個人情報は、不正アクセス・紛失・破壊・改ざん・漏洩を防止するため、適切なセキュリティ対策を講じます。ただし、インターネット上での完全な安全性を保証することはできません。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">8. 未成年者のご利用</h2>
              <p>本サービスは13歳未満の方の個人情報を意図的に収集することはありません。13歳未満の方の利用が判明した場合、該当する情報を速やかに削除します。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">9. ポリシーの変更</h2>
              <p>本ポリシーは、法令の改正・サービス内容の変更等に伴い、予告なく更新することがあります。重要な変更がある場合は、本サービス上にてお知らせします。変更後も本サービスをご利用いただいた場合、変更後のポリシーに同意したものとみなします。</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">10. お問い合わせ</h2>
              <p>プライバシーに関するご質問・ご要望は、本サービス内のお問い合わせフォームよりご連絡ください。</p>
              <p className="mt-2 text-gray-500">運営：にほんのいばしょ</p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
