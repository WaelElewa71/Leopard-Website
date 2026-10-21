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
    title: m.legal.privacyTitle,
    alternates: {
      canonical: `/${locale}/privacy`,
      languages: { ar: "/ar/privacy", en: "/en/privacy" },
    },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return null;
  const m = getMessages(rawLocale);
  return <LegalPage locale={rawLocale} title={m.legal.privacyTitle} body={m.legal.privacyBody} />;
}
