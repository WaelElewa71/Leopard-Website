import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getMessages, isLocale, type Locale } from "@/i18n/messages";
import "../globals.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const locale: Locale = rawLocale;
  const m = getMessages(locale);
  const title = `${m.brand.name} | ${m.brand.descriptor}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: {
      default: title,
      template: `%s | ${m.brand.name}`,
    },
    description: m.hero.description,
    alternates: {
      languages: {
        ar: "/ar",
        en: "/en",
      },
    },
    openGraph: {
      title,
      description: m.hero.description,
      type: "website",
      locale: locale === "ar" ? "ar_EG" : "en",
      ...(siteUrl
        ? {
            images: [
              {
                url: "/images/leopard-brand-banner.jpg",
                width: 1376,
                height: 768,
                alt: m.brandBanner.alt,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale;

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body>
        <div className="app-shell">
          <a className="skip-link" href="#main-content">
            {getMessages(locale).accessibility.skipMainContent}
          </a>
          <SiteHeader locale={locale} />
          {children}
          <SiteFooter locale={locale} />
        </div>
      </body>
    </html>
  );
}
