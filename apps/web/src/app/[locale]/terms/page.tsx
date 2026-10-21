import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { getMessages, isLocale } from "@/i18n/messages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return {
    title: m.legal.termsTitle,
    alternates: { canonical: `/${locale}/terms`, languages: { ar: "/ar/terms", en: "/en/terms" } },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return null;
  const m = getMessages(rawLocale);
  return <LegalPage locale={rawLocale} title={m.legal.termsTitle} body={m.legal.termsBody} />;
}
