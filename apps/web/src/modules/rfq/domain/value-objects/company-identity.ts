export function normalizeCompanyIdentity(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
}

export function normalizeContactEmail(value: string): string {
  return value.trim().toLocaleLowerCase("en");
}
