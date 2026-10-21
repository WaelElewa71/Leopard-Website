"use client";

import { useMemo, useRef, useState } from "react";
import {
  feedImporters,
  feedSuppliers,
  mapDirectoryRecordsToCompanies,
  type DirectoryLocale,
  type FeedHubCompany,
  type FeedHubProductId,
} from "@/lib/feed-hub-directory";

type ProductId = FeedHubProductId;
type CountryId = "all" | "SA" | "AE" | "QA" | "KW" | "OM";
type Language = DirectoryLocale;
type Company = FeedHubCompany;

type Product = { id: ProductId; ar: string; en: string };
type Country = { id: CountryId; ar: string; en: string; aliases: string[] };
type Copy = {
  title: string;
  subtitle: string;
  products: string;
  countries: string;
  allCountries: string;
  exporters: string;
  importers: string;
  emptyExporters: string;
  emptyImporters: string;
  verified: string;
  email: string;
  phone: string;
  website: string;
  count: string;
  results: string;
  activity: string;
  unclassified: string;
  unclassifiedNote: string;
  dataNote: string;
  directoryStats: string;
  productCount: string;
  supplierCount: string;
  importerCount: string;
};

const PRODUCTS: Product[] = [
  { id: "corn", ar: "الذرة الصفراء", en: "Yellow Feed Corn" },
  { id: "alfalfa", ar: "البرسيم الحجازي", en: "Alfalfa" },
  { id: "soymeal", ar: "كسبة الصويا", en: "Soybean Meal" },
];

const COUNTRIES: Country[] = [
  { id: "all", ar: "كل الدول", en: "All countries", aliases: [] },
  {
    id: "SA",
    ar: "السعودية",
    en: "Saudi Arabia",
    aliases: ["السعودية", "المملكة العربية السعودية", "Saudi Arabia", "SA"],
  },
  {
    id: "AE",
    ar: "الإمارات",
    en: "UAE",
    aliases: ["الإمارات", "الإمارات العربية المتحدة", "United Arab Emirates", "UAE", "AE"],
  },
  { id: "QA", ar: "قطر", en: "Qatar", aliases: ["قطر", "Qatar", "QA"] },
  { id: "KW", ar: "الكويت", en: "Kuwait", aliases: ["الكويت", "Kuwait", "KW"] },
  {
    id: "OM",
    ar: "عُمان",
    en: "Oman",
    aliases: ["عمان", "عُمان", "سلطنة عمان", "Oman", "OM"],
  },
];

const WORDS: Record<Language, Copy> = {
  ar: {
    title: "دليل الموردين والمستوردين",
    subtitle: "البرسيم الحجازي والذرة الصفراء وكسبة الصويا",
    products: "اختر المنتج",
    countries: "الدول المستوردة",
    allCountries: "كل الدول",
    exporters: "الموردون والمصدرون",
    importers: "المستوردون",
    emptyExporters: "لا يوجد موردون مسجلون لهذا المنتج حاليًا.",
    emptyImporters: "لا يوجد مستوردون مسجلون لهذا الاختيار حاليًا.",
    verified: "بيانات تم التحقق منها",
    email: "البريد الإلكتروني",
    phone: "الهاتف",
    website: "الموقع الإلكتروني",
    count: "شركة",
    results: "نتائج الدليل",
    activity: "النشاط",
    unclassified: "مستوردون دون تصنيف منتج",
    unclassifiedNote: "السجلات دي معروضة من غير إسنادها لأي منتج.",
    dataNote: "بيانات الدليل ثابتة؛ يُرجى التحقق من الجهات وبيانات التواصل قبل الاعتماد عليها.",
    directoryStats: "ملخص الدليل",
    productCount: "منتجات",
    supplierCount: "موردون",
    importerCount: "مستوردون",
  },
  en: {
    title: "Suppliers & Importers Directory",
    subtitle: "Alfalfa, yellow feed corn and soybean meal",
    products: "Choose a product",
    countries: "Importing countries",
    allCountries: "All countries",
    exporters: "Suppliers & Exporters",
    importers: "Importers",
    emptyExporters: "No suppliers listed for this product yet.",
    emptyImporters: "No importers listed for this selection yet.",
    verified: "Verified details",
    email: "Email",
    phone: "Phone",
    website: "Website",
    count: "companies",
    results: "Directory results",
    activity: "Activity",
    unclassified: "Importers without a product classification",
    unclassifiedNote: "These records are shown without assigning a product.",
    dataNote:
      "This is a static directory. Please verify company and contact details before relying on them.",
    directoryStats: "Directory summary",
    productCount: "products",
    supplierCount: "suppliers",
    importerCount: "importers",
  },
};

function normalizeCountry(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "");
}

function matchesCountry(companyCountry: string, countryId: CountryId): boolean {
  if (countryId === "all") return true;
  const selected = COUNTRIES.find((country) => country.id === countryId);
  if (!selected) throw new Error(`Unknown Feed Hub country id: ${countryId}`);
  const companyCountryKey = normalizeCountry(companyCountry);
  return selected.aliases.some((alias) => normalizeCountry(alias) === companyCountryKey);
}

function cleanWebsite(value: string): string | null {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function FeedHubContent({ language }: { language: Language }) {
  const t = WORDS[language];
  const resultsRef = useRef<HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductId>("corn");
  const [selectedCountry, setSelectedCountry] = useState<CountryId>("all");

  const exporters = useMemo(
    () => mapDirectoryRecordsToCompanies(feedSuppliers, language),
    [language],
  );
  const importers = useMemo(
    () => mapDirectoryRecordsToCompanies(feedImporters, language),
    [language],
  );
  const filteredExporters = useMemo(
    () => exporters.filter((company) => company.products.includes(selectedProduct)),
    [exporters, selectedProduct],
  );
  const filteredImporters = useMemo(
    () =>
      importers.filter(
        (company) =>
          company.products.includes(selectedProduct) &&
          matchesCountry(company.country, selectedCountry),
      ),
    [importers, selectedCountry, selectedProduct],
  );
  const unclassifiedImporters = useMemo(
    () =>
      importers.filter(
        (company) =>
          company.products.length === 0 && matchesCountry(company.country, selectedCountry),
      ),
    [importers, selectedCountry],
  );

  const selectedProductOption = PRODUCTS.find((product) => product.id === selectedProduct);
  const selectedCountryOption = COUNTRIES.find((country) => country.id === selectedCountry);
  if (!selectedProductOption || !selectedCountryOption) {
    throw new Error("Feed Hub filters contain an unknown product or country id.");
  }

  const scrollToResults = () => {
    if (typeof window === "undefined") return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior, block: "start" });
    });
  };

  return (
    <main
      id="main-content"
      lang={language}
      dir={language === "ar" ? "rtl" : "ltr"}
      className="feed-directory-page"
    >
      <div className="feed-directory-container">
        <header className="feed-directory-hero">
          <div className="feed-directory-hero-copy">
            <p className="feed-directory-eyebrow">Feed Hub</p>
            <h1 className="feed-directory-title">{t.title}</h1>
            <p className="feed-directory-subtitle">{t.subtitle}</p>
            <p className="feed-directory-data-note">{t.dataNote}</p>
          </div>
          <section className="feed-directory-hero-stats" aria-label={t.directoryStats}>
            <div className="feed-directory-stat">
              <strong>{PRODUCTS.length}</strong>
              <span>{t.productCount}</span>
            </div>
            <div className="feed-directory-stat">
              <strong>{feedSuppliers.length}</strong>
              <span>{t.supplierCount}</span>
            </div>
            <div className="feed-directory-stat">
              <strong>{feedImporters.length}</strong>
              <span>{t.importerCount}</span>
            </div>
          </section>
        </header>

        <section aria-labelledby="feed-products-title" className="feed-directory-product-section">
          <h2 id="feed-products-title" className="feed-directory-section-title">
            {t.products}
          </h2>
          <div className="feed-directory-product-grid">
            {PRODUCTS.map((product, index) => {
              const active = selectedProduct === product.id;
              const productName = product[language];
              const alternateName = product[language === "ar" ? "en" : "ar"];
              return (
                <button
                  key={product.id}
                  type="button"
                  aria-label={`${productName} — ${alternateName}`}
                  aria-pressed={active}
                  onClick={() => {
                    setSelectedProduct(product.id);
                    scrollToResults();
                  }}
                  className={`feed-directory-product-button${active ? " is-active" : ""}`}
                >
                  <span className="feed-directory-product-number" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span className="feed-directory-product-copy">
                    <span className="feed-directory-product-name">{productName}</span>
                    <span className="feed-directory-product-alt">{alternateName}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="feed-countries-title" className="feed-directory-country-panel">
          <h2 id="feed-countries-title" className="feed-directory-section-title">
            {t.countries}
          </h2>
          <div role="group" aria-label={t.countries} className="feed-directory-country-scroll">
            {COUNTRIES.map((country) => {
              const active = selectedCountry === country.id;
              return (
                <button
                  key={country.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelectedCountry(country.id);
                    scrollToResults();
                  }}
                  className={`feed-directory-country-button${active ? " is-active" : ""}`}
                >
                  {country.id === "all" ? t.allCountries : country[language]}
                </button>
              );
            })}
          </div>
        </section>

        <section
          ref={resultsRef}
          aria-labelledby="feed-results-title"
          className="feed-directory-results"
        >
          <header className="feed-directory-results-header">
            <div>
              <p className="feed-directory-results-eyebrow">{t.results}</p>
              <h2 id="feed-results-title" className="feed-directory-results-title">
                {selectedProductOption[language]}
              </h2>
            </div>
            <span className="feed-directory-current-filter">
              {t.countries}: <strong>{selectedCountryOption[language]}</strong>
            </span>
          </header>

          <div className="feed-directory-columns">
            <DirectoryColumn
              title={t.exporters}
              records={filteredExporters}
              unclassifiedRecords={[]}
              emptyMessage={t.emptyExporters}
              unclassifiedTitle={t.unclassified}
              language={language}
              tone="exporters"
            />
            <DirectoryColumn
              title={t.importers}
              records={filteredImporters}
              unclassifiedRecords={unclassifiedImporters}
              emptyMessage={t.emptyImporters}
              unclassifiedTitle={t.unclassified}
              unclassifiedNote={t.unclassifiedNote}
              language={language}
              tone="importers"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function DirectoryColumn({
  title,
  records,
  unclassifiedRecords,
  emptyMessage,
  unclassifiedTitle,
  unclassifiedNote,
  language,
  tone,
}: {
  title: string;
  records: Company[];
  unclassifiedRecords: Company[];
  emptyMessage: string;
  unclassifiedTitle: string;
  unclassifiedNote?: string;
  language: Language;
  tone: "exporters" | "importers";
}) {
  const t = WORDS[language];
  const total = records.length + unclassifiedRecords.length;

  return (
    <section className={`feed-directory-column is-${tone}`}>
      <header className="feed-directory-column-heading">
        <div className="feed-directory-column-heading-title">
          <h3>{title}</h3>
        </div>
        <span className="feed-directory-count">
          {total} {t.count}
        </span>
      </header>

      <div className="feed-directory-company-list">
        {records.length > 0 ? (
          records.map((company) => (
            <CompanyCard key={company.id} company={company} language={language} />
          ))
        ) : unclassifiedRecords.length === 0 ? (
          <div role="status" className="feed-directory-empty">
            <p>{emptyMessage}</p>
          </div>
        ) : null}

        {unclassifiedRecords.length > 0 ? (
          <section className="feed-directory-unclassified" aria-label={unclassifiedTitle}>
            <div className="feed-directory-unclassified-heading">
              <div>
                <h4>{unclassifiedTitle}</h4>
                {unclassifiedNote ? <p>{unclassifiedNote}</p> : null}
              </div>
              <span className="feed-directory-unclassified-badge">
                {unclassifiedRecords.length} {t.count}
              </span>
            </div>
            <div className="feed-directory-unclassified-list">
              {unclassifiedRecords.map((company) => (
                <CompanyCard key={company.id} company={company} language={language} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}

function CompanyCard({ company, language }: { company: Company; language: Language }) {
  const t = WORDS[language];
  const safeUrl = company.website ? cleanWebsite(company.website) : null;
  const phones = company.phones?.length ? company.phones : company.phone ? [company.phone] : [];
  const productTags = company.products
    .map((id) => PRODUCTS.find((product) => product.id === id))
    .filter((product): product is Product => product !== undefined);

  return (
    <article className="feed-directory-company-card">
      <div className="feed-directory-company-heading">
        <div className="feed-directory-company-identity">
          <h4>{company.name}</h4>
          <p className="feed-directory-company-location">
            {company.city ? `${company.city}، ` : ""}
            {company.country}
          </p>
        </div>
        {company.verified === true ? (
          <span className="feed-directory-verified">✓ {t.verified}</span>
        ) : null}
      </div>

      {productTags.length > 0 ? (
        <div className="feed-directory-product-tags-wrapper">
          <ul className="feed-directory-product-tags" aria-label={t.products}>
            {productTags.map((product) => (
              <li key={product.id}>{product[language]}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {company.activity ? (
        <div className="feed-directory-activity">
          <span className="feed-directory-activity-label">{t.activity}</span>
          <p>{company.activity}</p>
        </div>
      ) : null}

      {phones.length > 0 || company.email || safeUrl ? (
        <div className="feed-directory-contacts">
          {phones.map((phone) => (
            <a
              key={phone}
              className="feed-directory-contact-item"
              aria-label={`${t.phone}: ${phone}`}
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            >
              <strong>{t.phone}</strong>
              <span dir="ltr">{phone}</span>
            </a>
          ))}
          {company.email ? (
            <a
              className="feed-directory-contact-item"
              aria-label={`${t.email}: ${company.email}`}
              href={`mailto:${company.email}`}
            >
              <strong>{t.email}</strong>
              <span dir="ltr">{company.email}</span>
            </a>
          ) : null}
          {safeUrl ? (
            <a
              className="feed-directory-contact-item"
              aria-label={`${t.website}: ${company.website}`}
              dir="ltr"
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <strong>{t.website}</strong>
              <span>{company.website}</span>
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
