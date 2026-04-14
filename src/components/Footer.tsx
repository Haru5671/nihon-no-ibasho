import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-container mt-0 py-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 mb-8">
          {/* Brand */}
          <div>
            <p className="font-headline font-bold text-[18px] text-primary mb-1.5 tracking-tight">
              <span className="text-primary-container">に</span>ほんのいばしょ
            </p>
            <p className="text-[13px] text-on-surface-variant leading-relaxed max-w-sm">
              AI時代に、人間が人間の存在意味を支え合う場所。<br />
              匿名・登録不要・完全無料。
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-[13px] text-on-surface-variant">
            <Link href="/terms" className="hover:text-primary transition-colors">利用規約</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">プライバシーポリシー</Link>
            <a href="mailto:support@ibasho.co.jp" className="hover:text-primary transition-colors">お問い合わせ</a>
          </div>
        </div>

        {/* SEO keyword line */}
        <div className="border-t border-outline-variant/20 pt-6">
          <p className="text-[11px] text-outline leading-relaxed mb-3">
            AI失業・AIに仕事を奪われた・AIのせいで失業・AI嫌い・失業手当・再就職・有休消化・クビ・失業どうすれば・相談できない——同じ気持ちの人が集まる匿名コミュニティ
          </p>
          <p className="text-[11px] text-outline/60 text-center">
            &copy; {new Date().getFullYear()} にほんのいばしょ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
