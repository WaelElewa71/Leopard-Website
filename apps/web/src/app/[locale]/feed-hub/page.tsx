import type { Metadata } from "next";
import { FeedHubContent } from "@/components/feed-hub/feed-hub-content";
import { getMessages, isLocale } from "@/i18n/messages";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = getMessages(locale);
  return {
    title: messages.feedPage.title,
    alternates: {
      canonical: `/${locale}/feed-hub`,
      languages: { ar: "/ar/feed-hub", en: "/en/feed-hub" },
    },
  };
}

export default async function FeedHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  return <FeedHubContent language={locale} />;
}
