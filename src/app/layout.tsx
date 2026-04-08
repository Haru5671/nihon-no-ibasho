import type { Metadata } from "next";
import Script from "next/script";
import PageTracker from "@/components/PageTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "にほんのいばしょ — AI失業・失業手当・再就職の悩みを匿名で相談できる場所",
  description:
    "AIに仕事を奪われた、クビになった、失業手当の申請がわからない、再就職できない、有休消化中で不安——誰にも相談できない悩みを匿名・登録不要で話せるオンラインコミュニティです。AI嫌い・AI失業・失業どうすればと感じているあなたの居場所。",
  keywords: [
    "失業手当", "再就職", "AI失業", "AIに奪われた", "AIのせい", "AI嫌い",
    "相談できない", "失業 どうすれば", "有休消化", "クビ",
    "仕事 失った", "AI 仕事なくなる", "失業 相談", "再就職 不安",
    "にほんのいばしょ", "匿名 相談", "仕事 AI",
  ],
  openGraph: {
    title: "にほんのいばしょ — AI失業・失業手当・再就職の悩みを匿名で相談できる場所",
    description:
      "AIに仕事を奪われた、クビになった、失業手当がわからない、再就職できない——誰にも相談できない悩みを話せる場所。登録不要・完全無料。",
    url: "https://ibasho.co.jp",
    siteName: "にほんのいばしょ",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "にほんのいばしょ — AI失業・失業手当・再就職の悩みを匿名で相談",
    description:
      "AIのせいで仕事を失った、クビになった、有休消化中で先が見えない——誰にも言えない悩みを話せる場所。",
  },
  alternates: {
    canonical: "https://ibasho.co.jp",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://ibasho.co.jp/#website",
      url: "https://ibasho.co.jp",
      name: "にほんのいばしょ",
      description:
        "AI失業・失業手当・再就職など誰にも相談できない悩みを話せる匿名コミュニティ",
      inLanguage: "ja",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "AIに仕事を奪われたらどうすれば良いですか？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "AI失業は今や珍しくありません。まず同じ境遇の人と話すことで気持ちが楽になります。にほんのいばしょでは、AIのせいで仕事を失った方の声が集まっており、匿名で悩みを共有できます。",
          },
        },
        {
          "@type": "Question",
          name: "失業手当はいつからもらえますか？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "失業手当（雇用保険の基本手当）は、ハローワークで求職の申し込みをした後、待機期間7日間を経て受給が始まります。自己都合退職の場合はさらに給付制限期間があります。クビ（会社都合退職）の場合は待機期間後すぐに受給できます。",
          },
        },
        {
          "@type": "Question",
          name: "クビになったけど誰にも相談できない、どうすれば？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "クビや解雇は精神的に大きなダメージを与えます。家族や知人には話しにくいという方も多いです。にほんのいばしょでは匿名・登録不要で、同じ境遇の方と気持ちを分かち合えます。",
          },
        },
        {
          "@type": "Question",
          name: "有休消化中で再就職の不安が止まらない場合は？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "有休消化中は時間があるからこそ不安が大きくなりがちです。再就職への焦りや不安を一人で抱え込まず、同じ状況の人と話すことが大切です。にほんのいばしょで気持ちを吐き出してみてください。",
          },
        },
        {
          "@type": "Question",
          name: "AI嫌いになってしまったのですが、おかしいですか？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "AIのせいで仕事が変わったり奪われたりした場合、AI嫌いになるのは自然な感情です。おかしくありません。にほんのいばしょには同じ気持ちを持つ方が集まっています。",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased pt-[57px]">
        <PageTracker />
        {children}
        {process.env.NEXT_PUBLIC_ADSENSE_PUB_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
