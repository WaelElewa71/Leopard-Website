import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";
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
    title: m.nav.home,
    alternates: { canonical: `/${locale}`, languages: { ar: "/ar", en: "/en" } },
  };
}

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return null;
  return <HomePage locale={rawLocale} />;
}
