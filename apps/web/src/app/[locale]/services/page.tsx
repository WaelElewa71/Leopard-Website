import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileCheck2, Globe2, Plane, Ship, Truck, Warehouse } from "lucide-react";
import { PageIntro } from "@/components/layout/page-intro";
import { getMessages, isLocale, type Locale } from "@/i18n/messages";

const icons = [Ship, Plane, Truck, FileCheck2, Globe2, Warehouse];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return {
    title: m.servicesPage.title,
    alternates: {
      canonical: `/${locale}/services`,
      languages: { ar: "/ar/services", en: "/en/services" },
    },
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return null;
  const locale: Locale = rawLocale;
  const m = getMessages(locale);

  return (
    <main id="main-content" className="simple-page">
      <PageIntro eyebrow={m.servicesPage.eyebrow} title={m.servicesPage.title}>
        <p>{m.servicesPage.intro}</p>
      </PageIntro>
      <section className="section services-page-section">
        <div className="container">
          <div className="service-detail-grid">
            {m.services.items.map((service, index) => {
              const Icon = icons[index] ?? Globe2;
              return (
                <article className="service-detail-card" id={service.key} key={service.key}>
                  <div className="service-detail-top">
                    <span className="service-icon">
                      <Icon size={23} aria-hidden="true" />
                    </span>
                    <span className="card-index">0{index + 1}</span>
                  </div>
                  <h2>{service.title}</h2>
                  <p>{service.body}</p>
                  <Link className="text-link" href={`/${locale}/quote`}>
                    {m.common.requestQuote}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
          <p className="section-disclaimer">{m.servicesPage.disclaimer}</p>
        </div>
      </section>
      <section className="quote-band quote-band-compact">
        <div className="container quote-band-inner">
          <div>
            <p className="eyebrow eyebrow-light">{m.quoteBand.eyebrow}</p>
            <h2>{m.quoteBand.title}</h2>
          </div>
          <Link className="button button-gold" href={`/${locale}/quote`}>
            {m.common.requestQuote}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
