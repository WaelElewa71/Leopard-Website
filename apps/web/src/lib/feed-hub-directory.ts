import rawCountries from "../data/feed-hub/countries.json";
import rawImporters from "../data/feed-hub/importers.json";
import rawProducts from "../data/feed-hub/products.json";
import rawExporters from "../data/feed-hub/exporters.json";

export type FeedProductId = "corn" | "alfalfa" | "soybeanMeal";
export type FeedHubProductId = "corn" | "alfalfa" | "soymeal";
export type DirectoryLocale = "ar" | "en";
export type LocalizedValue = Record<DirectoryLocale, string>;

export interface FeedProductDefinition {
  id: FeedProductId;
  name: LocalizedValue;
}

export interface FeedDirectoryRecord {
  id: string;
  name: LocalizedValue;
  country: LocalizedValue;
  activity: LocalizedValue;
  products: FeedProductId[];
  city?: string;
  verified?: boolean;
  phones?: string[];
  email?: string;
  website?: string;
}

/** Data shape consumed by the frontend-only Feed Hub component. */
export interface FeedHubCompany {
  id: string;
  name: string;
  country: string;
  city?: string;
  products: FeedHubProductId[];
  phone?: string;
  phones?: string[];
  email?: string;
  website?: string;
  verified?: boolean;
  activity?: string;
}

type RawFeedDirectoryRecord = Omit<FeedDirectoryRecord, "products"> & {
  products: string[];
};

const REQUIRED_PRODUCT_IDS: FeedProductId[] = ["corn", "alfalfa", "soybeanMeal"];

function parseProductId(value: string): FeedProductId {
  if (value === "corn" || value === "alfalfa" || value === "soybeanMeal") return value;
  throw new Error(`Unknown Feed Hub product id in static data: ${value}`);
}

function parseDirectoryRecords(records: RawFeedDirectoryRecord[]): FeedDirectoryRecord[] {
  return records.map((record) => ({
    ...record,
    products: record.products.map(parseProductId),
  }));
}

export const feedProducts: FeedProductDefinition[] = rawProducts.map((product) => ({
  id: parseProductId(product.id),
  name: product.name,
}));

const configuredProductIds = new Set(feedProducts.map(({ id }) => id));
for (const productId of REQUIRED_PRODUCT_IDS) {
  if (!configuredProductIds.has(productId)) {
    throw new Error(`Missing required Feed Hub product in products.json: ${productId}`);
  }
}

export const feedCountries: LocalizedValue[] = rawCountries.map(({ ar, en }) => ({ ar, en }));
export const feedSuppliers = parseDirectoryRecords(rawExporters);
export const feedImporters = parseDirectoryRecords(rawImporters);

/** Map the existing bilingual JSON records to the component's current language. */
export function mapDirectoryRecordsToCompanies(
  records: FeedDirectoryRecord[],
  locale: DirectoryLocale,
): FeedHubCompany[] {
  return records.map((record) => {
    const company: FeedHubCompany = {
      id: record.id,
      name: record.name[locale],
      country: record.country[locale],
      activity: record.activity[locale],
      products: record.products.map((product) => (product === "soybeanMeal" ? "soymeal" : product)),
    };

    if (record.city !== undefined) company.city = record.city;
    if (record.verified !== undefined) company.verified = record.verified;
    if (record.phones?.length) company.phones = [...record.phones];
    if (record.email !== undefined) company.email = record.email;
    if (record.website !== undefined) company.website = record.website;

    return company;
  });
}

export function filterSuppliersByProduct(
  records: FeedDirectoryRecord[],
  productId: FeedProductId,
): FeedDirectoryRecord[] {
  return records.filter((record) => record.products.includes(productId));
}

export function filterImportersByProductAndCountry(
  records: FeedDirectoryRecord[],
  productId: FeedProductId,
  countryEnglishName?: string,
): FeedDirectoryRecord[] {
  return records.filter(
    (record) =>
      record.products.includes(productId) &&
      (!countryEnglishName || record.country.en === countryEnglishName),
  );
}

export function filterUnclassifiedImportersByCountry(
  records: FeedDirectoryRecord[],
  countryEnglishName?: string,
): FeedDirectoryRecord[] {
  return records.filter(
    (record) =>
      record.products.length === 0 &&
      (!countryEnglishName || record.country.en === countryEnglishName),
  );
}
