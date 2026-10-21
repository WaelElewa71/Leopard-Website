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
    title: m.legal.disclaimerTitle,
    alternates: {
      canonical: `/${locale}/disclaimer`,
      languages: { ar: "/ar/disclaimer", en: "/en/disclaimer" },
    },
  };
}

export default async function DisclaimerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return null;
  const m = getMessages(rawLocale);
  return (
    <LegalPage locale={rawLocale} title={m.legal.disclaimerTitle} body={m.legal.disclaimerBody} />
  );
}
