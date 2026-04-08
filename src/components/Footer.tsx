import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
          <div>
            <p className="text-gray-900 font-bold text-[15px] mb-1">にほんのいばしょ</p>
            <p className="text-gray-400 text-[12px]">AI時代に、人間が人間の存在意味を支え合う場所</p>
          </div>
          <div className="flex gap-5 text-[12px] text-gray-400">
            <Link href="/terms" className="hover:text-gray-700 transition-colors">利用規約</Link>
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">プライバシーポリシー</Link>
            <a href="#" className="hover:text-gray-700 transition-colors">お問い合わせ</a>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-5">
          <p className="text-gray-300 text-[11px] leading-relaxed mb-3">
            AI失業 / AIに仕事を奪われた / AIのせいで失業 / AI嫌い / 失業手当 / 再就職 / 有休消化 / クビ / 失業どうすれば / 相談できない——同じ気持ちの人が集まる匿名コミュニティ
          </p>
          <p className="text-gray-400 text-[11px] text-center">
            &copy; {new Date().getFullYear()} にほんのいばしょ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
