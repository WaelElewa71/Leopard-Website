import type { Metadata } from "next";
import { FeaturePage } from "@/components/layout/feature-page";
import { getMessages, isLocale } from "@/i18n/messages";
import { publicContact } from "@/lib/public-contact";
import { publicResources } from "@/lib/public-resources";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return {
    title: m.academyPage.title,
    alternates: {
      canonical: `/${locale}/academy`,
      languages: { ar: "/ar/academy", en: "/en/academy" },
    },
  };
}

export default async function AcademyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return null;
  const m = getMessages(rawLocale);
  return (
    <FeaturePage
      locale={rawLocale}
      eyebrow={m.academyPage.eyebrow}
      title={m.academyPage.title}
      body={m.academyPage.body}
      notice={m.academyPage.notice}
      cta={m.academyPage.cta}
      href={`/${rawLocale}/contact`}
      youtubeCta={m.academyPage.youtubeCta}
      youtubeHref={publicContact.youtubeHref}
      libraryCta={m.academyPage.libraryCta}
      libraryHref={publicResources.ebookLibraryUrl}
    />
  );
}
