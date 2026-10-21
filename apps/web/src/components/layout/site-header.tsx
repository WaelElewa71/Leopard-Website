"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { getMessages, type Locale } from "@/i18n/messages";

const primaryLinks = [
  { key: "about", path: "/about" },
  { key: "services", path: "/services" },
  { key: "feedHub", path: "/feed-hub" },
  { key: "academy", path: "/academy" },
  { key: "contact", path: "/contact" },
] as const;

export function SiteHeader({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const otherLocale = locale === "ar" ? "en" : "ar";
  const routeTail = pathname.split("/").slice(2).join("/");
  const languageHref = `/${otherLocale}${routeTail ? `/${routeTail}` : ""}`;

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          className="brand"
          href={`/${locale}`}
          aria-label={`${m.brand.name} — ${m.nav.home}`}
          onClick={() => setMenuOpen(false)}
        >
          <span className="brand-mark" aria-hidden="true">
            <Image src="/images/leopard-logo-mark.webp" alt="" width={457} height={400} priority />
          </span>
          <span className="brand-copy">
            <span className="brand-name">{m.brand.name}</span>
            <span className="brand-descriptor">{m.brand.descriptor}</span>
          </span>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? m.nav.closeMenu : m.nav.openMenu}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>

        <nav
          id="primary-navigation"
          className={`primary-navigation${menuOpen ? " is-open" : ""}`}
          aria-label={m.nav.primaryNavigation}
        >
          <Link className="nav-home" href={`/${locale}`} onClick={() => setMenuOpen(false)}>
            {m.nav.home}
          </Link>
          {primaryLinks.map((item) => (
            <Link key={item.key} href={`/${locale}${item.path}`} onClick={() => setMenuOpen(false)}>
              {m.nav[item.key]}
            </Link>
          ))}
          <div className="nav-actions">
            <Link
              className="language-link"
              href={languageHref}
              lang={otherLocale}
              hrefLang={otherLocale}
              onClick={() => setMenuOpen(false)}
            >
              {m.nav.language}
            </Link>
            <Link
              className="button button-small button-primary"
              href={`/${locale}/quote`}
              onClick={() => setMenuOpen(false)}
            >
              {m.nav.quote}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
