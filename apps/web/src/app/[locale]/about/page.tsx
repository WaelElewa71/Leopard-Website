import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { PageIntro } from "@/components/layout/page-intro";
import { getMessages, isLocale, type Locale } from "@/i18n/messages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return {
    title: m.about.title,
    alternates: { canonical: `/${locale}/about`, languages: { ar: "/ar/about", en: "/en/about" } },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return null;
  const locale: Locale = rawLocale;
  const m = getMessages(locale);

  return (
    <main id="main-content" className="simple-page">
      <PageIntro eyebrow={m.about.eyebrow} title={m.about.title}>
        <p>{m.about.intro}</p>
      </PageIntro>
      <section className="section purpose-section" id="purpose">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{m.about.directionEyebrow}</p>
              <h2>{m.about.directionTitle}</h2>
            </div>
            <p className="section-intro">{m.about.directionIntro}</p>
          </div>
          <nav className="purpose-jump-nav" aria-label={m.about.purposeNavLabel}>
            {m.about.purposes.map((purpose) => (
              <a className="purpose-jump-button" href={`#purpose-${purpose.id}`} key={purpose.id}>
                {purpose.label}
              </a>
            ))}
          </nav>
          <div className="purpose-grid">
            {m.about.purposes.map((purpose, index) => (
              <article className="purpose-card" id={`purpose-${purpose.id}`} key={purpose.id}>
                <span className="purpose-index">0{index + 1}</span>
                <p className="eyebrow">{purpose.label}</p>
                <h3>{purpose.title}</h3>
                <p>{purpose.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section about-section">
        <div className="container about-layout">
          <div className="about-copy">
            <p className="eyebrow">{m.about.approachEyebrow}</p>
            <h2>{m.about.principleTitle}</h2>
            <p>{m.about.body}</p>
            <Link className="button button-primary" href={`/${locale}/quote`}>
              {m.common.requestQuote}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="principles-panel">
            {m.about.principles.map((principle, index) => (
              <div className="principle-row" key={principle}>
                <span className="principle-index">0{index + 1}</span>
                <p>{principle}</p>
                <Check size={17} aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section about-note-section">
        <div className="container about-note">
          <p className="eyebrow">{m.about.serviceScopeEyebrow}</p>
          <p>{m.servicesPage.disclaimer}</p>
        </div>
      </section>
    </main>
  );
}
