import type { Metadata } from "next";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { PageIntro } from "@/components/layout/page-intro";
import { getMessages, isLocale } from "@/i18n/messages";
import { QuoteForm } from "@/modules/rfq/presentation/components/quote-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return {
    title: m.quote.title,
    alternates: { canonical: `/${locale}/quote`, languages: { ar: "/ar/quote", en: "/en/quote" } },
  };
}

export default async function QuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const query = await searchParams;
  if (!isLocale(rawLocale)) return null;
  const source = query.source === "feed-hub" ? "feed-hub" : "website";
  const m = getMessages(rawLocale);

  return (
    <main id="main-content" className="simple-page quote-page">
      <PageIntro eyebrow={m.quote.eyebrow} title={m.quote.title}>
        <p>{m.quote.intro}</p>
      </PageIntro>
      <section className="section quote-form-section">
        <div className="container quote-layout">
          <aside className="quote-sidebar">
            <div className="quote-side-card">
              <span className="quote-side-icon">
                <ShieldCheck size={22} aria-hidden="true" />
              </span>
              <h2>{m.common.humanReview}</h2>
              <p>{m.process.intro}</p>
            </div>
            <div className="quote-side-alert">
              <AlertTriangle size={18} aria-hidden="true" />
              <p>{m.quote.privacyDraft}</p>
            </div>
          </aside>
          <QuoteForm locale={rawLocale} source={source} />
        </div>
      </section>
    </main>
  );
}
