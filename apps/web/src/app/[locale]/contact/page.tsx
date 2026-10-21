import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CirclePlay, Globe2, Mail, Phone } from "lucide-react";
import { PageIntro } from "@/components/layout/page-intro";
import { getMessages, isLocale } from "@/i18n/messages";
import { publicContact } from "@/lib/public-contact";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return {
    title: m.contact.title,
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { ar: "/ar/contact", en: "/en/contact" },
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return null;
  const m = getMessages(rawLocale);

  return (
    <main id="main-content" className="simple-page">
      <PageIntro eyebrow={m.contact.eyebrow} title={m.contact.title}>
        <p>{m.contact.body}</p>
      </PageIntro>
      <section className="section contact-section">
        <div className="container contact-layout">
          <div className="contact-card">
            <span className="contact-card-icon">
              <ArrowUpRight size={22} aria-hidden="true" />
            </span>
            <h2>{m.contact.cta}</h2>
            <p>{m.contact.note}</p>
            <Link className="button button-primary" href={`/${rawLocale}/quote`}>
              {m.common.requestQuote}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="contact-channel-list">
            <p className="eyebrow">{m.contact.officialContacts}</p>
            <a className="contact-channel-item" href={`mailto:${publicContact.email}`}>
              <Mail size={18} aria-hidden="true" />
              <span className="contact-channel-copy">
                <span className="contact-channel-label">{m.contact.emailLabel}</span>
                <span className="contact-channel-value" dir="ltr">
                  {publicContact.email}
                </span>
              </span>
            </a>
            <a className="contact-channel-item" href={publicContact.phoneHref}>
              <Phone size={18} aria-hidden="true" />
              <span className="contact-channel-copy">
                <span className="contact-channel-label">{m.contact.phoneLabel}</span>
                <span className="contact-channel-value" dir="ltr">
                  {publicContact.phoneDisplay}
                </span>
              </span>
            </a>
            <a
              className="contact-channel-item"
              href={publicContact.websiteHref}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Globe2 size={18} aria-hidden="true" />
              <span className="contact-channel-copy">
                <span className="contact-channel-label">{m.contact.websiteLabel}</span>
                <span className="contact-channel-value" dir="ltr">
                  {publicContact.websiteDisplay}
                </span>
              </span>
            </a>
            <a
              className="contact-channel-item"
              href={publicContact.youtubeHref}
              target="_blank"
              rel="noreferrer noopener"
            >
              <CirclePlay size={18} aria-hidden="true" />
              <span className="contact-channel-copy">
                <span className="contact-channel-label">{m.contact.youtubeLabel}</span>
                <span className="contact-channel-value" dir="ltr">
                  youtube.com/@waelelewa4660
                </span>
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
