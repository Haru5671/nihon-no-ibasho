import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SubscriptionSuccessPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f8fafb] min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-sm mx-auto text-center">
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-3">
              パーソナル会員になりました
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              いばしょパーソナルへようこそ。
              <br />
              より深いつながりをお楽しみください。
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              トップに戻る
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
