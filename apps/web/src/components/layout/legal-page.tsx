import { AlertTriangle } from "lucide-react";
import { PageIntro } from "./page-intro";
import { getMessages, type Locale } from "@/i18n/messages";

export function LegalPage({
  locale,
  title,
  body,
}: {
  locale: Locale;
  title: string;
  body: string;
}) {
  const messages = getMessages(locale);
  const draft = messages.legal.draft;

  return (
    <main id="main-content" className="simple-page">
      <PageIntro eyebrow={messages.legal.infoEyebrow} title={title} />
      <section className="section legal-section">
        <div className="container legal-card">
          <div className="legal-draft-banner">
            <AlertTriangle size={18} aria-hidden="true" />
            <p>{draft}</p>
          </div>
          <p>{body}</p>
        </div>
      </section>
    </main>
  );
}
