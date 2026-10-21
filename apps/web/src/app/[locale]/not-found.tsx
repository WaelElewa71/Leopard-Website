"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getMessages } from "@/i18n/messages";

export default function LocaleNotFound() {
  const pathname = usePathname();
  const locale = pathname?.startsWith("/en/") ? "en" : "ar";
  const m = getMessages(locale);
  return (
    <main id="main-content" className="simple-page">
      <section className="container empty-state">
        <p className="eyebrow">404</p>
        <h1>{m.errors.notFoundTitle}</h1>
        <p>{m.errors.notFoundBody}</p>
        <Link className="button button-primary" href={`/${locale}`}>
          {m.errors.backHome}
        </Link>
      </section>
    </main>
  );
}
