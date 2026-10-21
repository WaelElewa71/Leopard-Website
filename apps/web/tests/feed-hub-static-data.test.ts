import { describe, expect, it } from "vitest";
import {
  feedCountries,
  feedImporters,
  feedProducts,
  feedSuppliers,
  filterImportersByProductAndCountry,
  filterSuppliersByProduct,
  filterUnclassifiedImportersByCountry,
  mapDirectoryRecordsToCompanies,
} from "../src/lib/feed-hub-directory";

describe("Feed Hub static directory data", () => {
  it("keeps the three product buttons and country filters in the requested order", () => {
    expect(feedProducts.map(({ id }) => id)).toEqual(["corn", "alfalfa", "soybeanMeal"]);
    expect(feedCountries.map(({ ar }) => ar)).toEqual([
      "السعودية",
      "الإمارات",
      "قطر",
      "الكويت",
      "عُمان",
    ]);
  });

  it("preserves all existing supplier and importer records without duplicate ids", () => {
    expect(feedSuppliers).toHaveLength(10);
    expect(feedImporters).toHaveLength(9);
    expect(new Set(feedSuppliers.map(({ id }) => id)).size).toBe(10);
    expect(new Set(feedImporters.map(({ id }) => id)).size).toBe(9);
    expect(feedSuppliers.map(({ id }) => id)).toEqual([
      "el-shahd",
      "thimar-agriculture",
      "greena-alfalfa",
      "al-reefia",
      "nile-verde",
      "oilex",
      "esraa-trade",
      "al-nada-soy",
      "hany-mazhar-group",
      "egypt-globe-group",
    ]);
    expect(feedImporters.map(({ id }) => id)).toEqual([
      "zawiah-feeds",
      "al-hitmi-foods",
      "ieco",
      "united-natural-products",
      "sohul-al-maha",
      "alfalfa-al-salmi",
      "feeds-kuwait",
      "kuwait-animal-feed-factory",
      "kfo",
    ]);
  });

  it("maps the source records to the component shape without losing product ids or contacts", () => {
    const arabicExporters = mapDirectoryRecordsToCompanies(feedSuppliers, "ar");
    const englishImporters = mapDirectoryRecordsToCompanies(feedImporters, "en");
    const elShahd = arabicExporters.find(({ id }) => id === "el-shahd");
    const oilex = arabicExporters.find(({ id }) => id === "oilex");
    const unclassified = englishImporters.filter(({ products }) => products.length === 0);

    expect(arabicExporters).toHaveLength(10);
    expect(englishImporters).toHaveLength(9);
    expect(elShahd).toMatchObject({
      name: "الشهد للحاصلات والأعلاف",
      country: "مصر",
      phones: ["01096754864", "01204424045"],
    });
    expect(oilex?.products).toEqual(["soymeal"]);
    expect(unclassified).toHaveLength(5);
    expect(unclassified.every(({ products }) => products.length === 0)).toBe(true);
    expect(elShahd).not.toHaveProperty("city");
    expect(elShahd).not.toHaveProperty("verified");
  });

  it("filters exporters by product only and importers by product plus selected country", () => {
    expect(filterSuppliersByProduct(feedSuppliers, "corn").map(({ id }) => id)).toEqual([
      "el-shahd",
      "hany-mazhar-group",
    ]);
    expect(
      filterImportersByProductAndCountry(feedImporters, "corn", "Oman").map(({ id }) => id),
    ).toEqual(["sohul-al-maha"]);
    expect(filterImportersByProductAndCountry(feedImporters, "corn", "Saudi Arabia")).toEqual([]);
    expect(
      filterImportersByProductAndCountry(feedImporters, "soybeanMeal", "Saudi Arabia").map(
        ({ id }) => id,
      ),
    ).toEqual(["ieco"]);
  });

  it("keeps unclassified importers separate and applies the country filter without assigning products", () => {
    const unclassified = feedImporters.filter((record) => record.products.length === 0);
    expect(unclassified).toHaveLength(5);
    expect(
      filterUnclassifiedImportersByCountry(feedImporters, "Kuwait").map(({ id }) => id),
    ).toEqual(["alfalfa-al-salmi", "feeds-kuwait", "kuwait-animal-feed-factory", "kfo"]);
    expect(unclassified.every((record) => record.products.length === 0)).toBe(true);
  });
});
