import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopicIcon from "@/components/TopicIcon";
import { getSoudan, SOUDAN_PAGES } from "@/data/soudan";
import { getPosts } from "@/lib/posts";
import { timeAgo } from "@/lib/utils";

export const revalidate = 3600;

export function generateStaticParams() {
  return SOUDAN_PAGES.map((p) => ({ theme: p.slug }));
}

const jsonLdStr = (obj: unknown) => JSON.stringify(obj).replace(/</g, "\\u003c");

export async function generateMetadata({ params }: { params: { theme: string } }): Promise<Metadata> {
  const page = getSoudan(params.theme);
  if (!page) return { title: "ページが見つかりません | にほんのいばしょ", robots: { index: false, follow: true } };
  return {
    title: page.title,
    description: page.metaDescription,
    keywords: page.relatedKeywords,
    alternates: { canonical: `/soudan/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: `/soudan/${page.slug}`,
      siteName: "にほんのいばしょ",
      locale: "ja_JP",
      type: "article",
    },
  };
}

export default async function SoudanPage({ params }: { params: { theme: string } }) {
  const page = getSoudan(params.theme);
  if (!page) notFound();

  const allPosts = await getPosts(50);
  const related = allPosts.filter((p) => p.topic === page.topicFilter).slice(0, 5);
  const others = SOUDAN_PAGES.filter((p) => p.slug !== page.slug);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://ibasho.co.jp/" },
      { "@type": "ListItem", position: 2, name: page.label, item: `https://ibasho.co.jp/soudan/${page.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdStr(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdStr(breadcrumbLd) }} />
      <Header />
      <main className="bg-surface min-h-screen pt-20">

        {/* Hero */}
        <div className="editorial-gradient">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
            <nav aria-label="パンくず" className="text-xs text-white/80 mb-4 flex items-center gap-1.5">
              <Link href="/" className="hover:text-white underline-offset-2 hover:underline">ホーム</Link>
              <span aria-hidden>›</span>
              <span className="text-white">{page.label}の相談</span>
            </nav>
            <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-[1.3] mb-4 text-balance">
              {page.h1}
            </h1>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed">{page.lead}</p>
            <Link
              href="/#hiroba"
              className="inline-flex items-center justify-center gap-2 mt-7 rounded-full bg-white text-primary font-bold text-base px-7 py-3.5 shadow-mindful hover:bg-white/90 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              いまの気持ちを匿名で話す
            </Link>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
          {/* Sections */}
          {page.sections.map((s) => (
            <section key={s.heading} className="mb-12">
              <h2 className="font-headline font-bold text-2xl text-on-surface mb-4">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="text-[15px] text-on-surface-variant leading-loose mb-4">{p}</p>
              ))}
            </section>
          ))}

          {/* Related posts */}
          {related.length > 0 && (
            <section className="mb-12">
              <h2 className="font-headline font-bold text-2xl text-on-surface mb-2">
                同じ悩みの声
              </h2>
              <p className="text-sm text-on-surface-variant mb-5">
                にほんのいばしょに実際に寄せられた、匿名の声です。
              </p>
              <div className="space-y-3">
                {related.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="block bg-surface-container-lowest rounded-2xl shadow-card hover:shadow-card-hover transition-all p-5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-xs text-on-surface-variant font-semibold">
                        <TopicIcon topic={post.topic} size={11} />
                        {post.topic}
                      </span>
                      <span className="text-xs text-on-surface-variant ml-auto">{timeAgo(post.created_at)}</span>
                    </div>
                    <p className="text-[15px] text-on-surface leading-loose line-clamp-3 whitespace-pre-line">{post.body}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="font-headline font-bold text-2xl text-on-surface mb-5">よくある質問</h2>
            <div className="divide-y divide-outline-variant/30 border-y border-outline-variant/30">
              {page.faqs.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex items-start gap-3 cursor-pointer list-none text-on-surface font-semibold text-base leading-relaxed marker:hidden">
                    <span aria-hidden className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm transition-transform group-open:rotate-45">+</span>
                    <span>{f.q}</span>
                  </summary>
                  <p className="mt-3 pl-8 text-[15px] text-on-surface-variant leading-loose">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-2xl editorial-gradient p-7 sm:p-9 text-center mb-12">
            <p className="font-headline font-bold text-xl sm:text-2xl text-white mb-3">
              ひとりで抱えなくて、大丈夫。
            </p>
            <p className="text-sm text-white/90 mb-6 leading-relaxed">
              匿名・登録不要・無料。唯一のルールは「悪口禁止」だけ。<br className="hidden sm:block" />
              同じ気持ちの人が、必ずどこかで読んでいます。
            </p>
            <Link
              href="/#hiroba"
              className="inline-flex items-center justify-center rounded-full bg-white text-primary font-bold text-base px-8 py-3.5 shadow-mindful hover:bg-white/90 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              気持ちを話してみる
            </Link>
          </section>

          {/* Other themes */}
          <section aria-labelledby="other-themes">
            <h2 id="other-themes" className="font-headline font-bold text-lg text-on-surface mb-4">ほかの悩みの相談</h2>
            <div className="flex flex-wrap gap-2">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/soudan/${o.slug}`}
                  className="text-sm font-semibold text-primary bg-primary/8 hover:bg-primary/15 rounded-full px-4 py-2 transition-colors"
                >
                  {o.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
