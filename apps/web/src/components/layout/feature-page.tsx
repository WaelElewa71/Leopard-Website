import Link from "next/link";
import { ArrowUpRight, BookOpen, CirclePlay } from "lucide-react";
import { PageIntro } from "./page-intro";
import { getMessages, type Locale } from "@/i18n/messages";

export function FeaturePage({
  locale,
  eyebrow,
  title,
  body,
  notice,
  cta,
  href,
  youtubeCta,
  youtubeHref,
  libraryCta,
  libraryHref,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  body: string;
  notice: string;
  cta?: string;
  href?: string;
  youtubeCta?: string;
  youtubeHref?: string;
  libraryCta?: string;
  libraryHref?: string;
}) {
  const hasActions = Boolean(
    (cta && href) || (youtubeCta && youtubeHref) || (libraryCta && libraryHref),
  );

  return (
    <main id="main-content" className="simple-page">
      <PageIntro eyebrow={eyebrow} title={title}>
        <p>{body}</p>
      </PageIntro>
      <section className="section feature-page-section">
        <div className="container feature-page-card">
          <div className="feature-status">
            <span className="status-dot" />
            {getMessages(locale).common.launchStatus}
          </div>
          <p>{notice}</p>
          {hasActions ? (
            <div className="feature-page-actions">
              {cta && href ? (
                <Link className="button button-primary" href={href}>
                  {cta}
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              ) : null}
              {youtubeCta && youtubeHref ? (
                <a
                  className="button button-outline"
                  href={youtubeHref}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {youtubeCta}
                  <CirclePlay size={17} aria-hidden="true" />
                </a>
              ) : null}
              {libraryCta && libraryHref ? (
                <a
                  className="button button-outline"
                  href={libraryHref}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {libraryCta}
                  <BookOpen size={17} aria-hidden="true" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
