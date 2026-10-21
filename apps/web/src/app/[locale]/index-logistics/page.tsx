import type { Metadata } from "next";
import { FeaturePage } from "@/components/layout/feature-page";
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
    title: m.indexPage.title,
    alternates: {
      canonical: `/${locale}/index-logistics`,
      languages: { ar: "/ar/index-logistics", en: "/en/index-logistics" },
    },
  };
}

export default async function IndexLogisticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return null;
  const m = getMessages(rawLocale);
  return (
    <FeaturePage
      locale={rawLocale}
      eyebrow={m.indexPage.eyebrow}
      title={m.indexPage.title}
      body={m.indexPage.body}
      notice={m.indexPage.notice}
    />
  );
}
