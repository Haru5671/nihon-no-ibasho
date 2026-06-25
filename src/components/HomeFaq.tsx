import Link from "next/link";

/** 可視 FAQ + サービス説明。
 *  layout.tsx の FAQPage 構造化データと文言を一致させ、リッチリザルト要件を満たしつつ
 *  検索意図（AI失業・失業手当・再就職・クビ・有休消化）に応える静的コンテンツを初期 HTML に含める。 */

const FAQS: { q: string; a: string }[] = [
  {
    q: "AIに仕事を奪われたらどうすれば良いですか？",
    a: "AI失業は今や珍しくありません。まず同じ境遇の人と話すことで気持ちが楽になります。にほんのいばしょでは、AIのせいで仕事を失った方の声が集まっており、匿名で悩みを共有できます。",
  },
  {
    q: "失業手当はいつからもらえますか？",
    a: "失業手当（雇用保険の基本手当）は、ハローワークで求職の申し込みをした後、待機期間7日間を経て受給が始まります。自己都合退職の場合はさらに給付制限期間があります。クビ（会社都合退職）の場合は待機期間後すぐに受給できます。",
  },
  {
    q: "クビになったけど誰にも相談できない、どうすれば？",
    a: "クビや解雇は精神的に大きなダメージを与えます。家族や知人には話しにくいという方も多いです。にほんのいばしょでは匿名・登録不要で、同じ境遇の方と気持ちを分かち合えます。",
  },
  {
    q: "有休消化中で再就職の不安が止まらない場合は？",
    a: "有休消化中は時間があるからこそ不安が大きくなりがちです。再就職への焦りや不安を一人で抱え込まず、同じ状況の人と話すことが大切です。にほんのいばしょで気持ちを吐き出してみてください。",
  },
  {
    q: "AI嫌いになってしまったのですが、おかしいですか？",
    a: "AIのせいで仕事が変わったり奪われたりした場合、AI嫌いになるのは自然な感情です。おかしくありません。にほんのいばしょには同じ気持ちを持つ方が集まっています。",
  },
];

export default function HomeFaq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-surface border-t border-outline-variant/30"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-14 sm:py-20">
        {/* About */}
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 font-label">
          にほんのいばしょとは
        </p>
        <h2
          id="faq-heading"
          className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight leading-snug mb-5 text-balance"
        >
          AI失業・失業手当・再就職の悩みを、
          <br className="hidden sm:block" />
          匿名でそっと話せる場所
        </h2>
        <p className="text-base text-on-surface-variant leading-loose mb-12 max-w-2xl">
          「AIに仕事を奪われた」「クビになったけど誰にも言えない」「失業手当の申請がわからない」
          「再就職できるか不安」「有休消化中で気持ちが沈む」——そんな、家族にも友だちにも打ち明けにくい悩みを、
          登録不要・完全無料・匿名で書き込めるオンラインコミュニティです。同じ気持ちの人が、必ずどこかで読んでいます。
        </p>

        {/* FAQ */}
        <h3 className="font-headline font-bold text-xl text-on-surface mb-5">
          よくある質問
        </h3>
        <div className="divide-y divide-outline-variant/30 border-y border-outline-variant/30">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex items-start gap-3 cursor-pointer list-none text-on-surface font-semibold text-base leading-relaxed marker:hidden">
                <span
                  aria-hidden
                  className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm transition-transform group-open:rotate-45"
                >
                  +
                </span>
                <span>{f.q}</span>
              </summary>
              <p className="mt-3 pl-8 text-[15px] text-on-surface-variant leading-loose">
                {f.a}
              </p>
            </details>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href="/#hiroba"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-on-primary font-bold text-base px-7 py-3.5 shadow-mindful hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            いまの気持ちを話してみる
          </Link>
          <p className="text-sm text-on-surface-variant">
            匿名・登録不要・無料。唯一のルールは「悪口禁止」だけ。
          </p>
        </div>
      </div>
    </section>
  );
}
