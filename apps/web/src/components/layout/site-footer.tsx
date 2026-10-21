import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CirclePlay, Mail, Phone } from "lucide-react";
import { getMessages, type Locale } from "@/i18n/messages";
import { publicContact } from "@/lib/public-contact";

export function SiteFooter({ locale }: { locale: Locale }) {
  const m = getMessages(locale);

  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand-block">
          <Link
            className="brand brand-footer"
            href={`/${locale}`}
            aria-label={`${m.brand.name} — ${m.nav.home}`}
          >
            <span className="brand-mark" aria-hidden="true">
              <Image src="/images/leopard-logo-mark.webp" alt="" width={457} height={400} />
            </span>
            <span className="brand-copy">
              <span className="brand-name">{m.brand.name}</span>
              <span className="brand-descriptor">{m.brand.descriptor}</span>
            </span>
          </Link>
          <p>{m.footer.statement}</p>
          <Link className="footer-quote-link" href={`/${locale}/quote`}>
            {m.footer.quote}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <div className="footer-contact-links">
            <a href={`mailto:${publicContact.email}`}>
              <Mail size={14} aria-hidden="true" />
              <span>{publicContact.email}</span>
            </a>
            <a href={publicContact.phoneHref} dir="ltr">
              <Phone size={14} aria-hidden="true" />
              <span>{publicContact.phoneDisplay}</span>
            </a>
            <a href={publicContact.youtubeHref} target="_blank" rel="noreferrer noopener">
              <CirclePlay size={14} aria-hidden="true" />
              <span>{m.contact.youtubeLabel}</span>
            </a>
          </div>
        </div>
        <div className="footer-column">
          <h2>{m.footer.company}</h2>
          <Link href={`/${locale}/about`}>{m.footer.about}</Link>
          <Link href={`/${locale}/services`}>{m.footer.services}</Link>
          <Link href={`/${locale}/contact`}>{m.footer.contact}</Link>
        </div>
        <div className="footer-column">
          <h2>{m.footer.resources}</h2>
          <Link href={`/${locale}/academy`}>{m.footer.academy}</Link>
          <Link href={`/${locale}/feed-hub`}>{m.footer.feedHub}</Link>
          <Link href={`/${locale}/index-logistics`}>Index Logistics</Link>
        </div>
        <div className="footer-column">
          <h2>{m.footer.legal}</h2>
          <Link href={`/${locale}/privacy`}>{m.footer.privacy}</Link>
          <Link href={`/${locale}/terms`}>{m.footer.terms}</Link>
          <Link href={`/${locale}/disclaimer`}>{m.footer.disclaimer}</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>
          © {new Date().getFullYear()} {m.footer.copyright}
        </p>
        <p>{m.footer.ownerReview}</p>
      </div>
    </footer>
  );
}
