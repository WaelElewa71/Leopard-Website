import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowUpRight,
  Box,
  Check,
  ClipboardCheck,
  FileCheck2,
  Globe2,
  Plane,
  Ship,
  Truck,
  Warehouse,
} from "lucide-react";
import { getMessages, type Locale } from "@/i18n/messages";

const serviceIcons = [Ship, Plane, Truck, FileCheck2, Globe2, Warehouse];
const stepsIcons = [ClipboardCheck, FileCheck2, Globe2, Check];

export function HomePage({ locale }: { locale: Locale }) {
  const m = getMessages(locale);
  const upIcon = locale === "ar" ? ArrowUpLeft : ArrowUpRight;
  const CtaArrow = upIcon;
  const sectionLinks = [
    { href: "#home-intro", label: m.homeSectionNav.items.home },
    { href: "#approach", label: m.homeSectionNav.items.approach },
    { href: "#services", label: m.homeSectionNav.items.services },
    { href: "#why-leopard", label: m.homeSectionNav.items.why },
    { href: "#process", label: m.homeSectionNav.items.process },
    { href: "#quote", label: m.homeSectionNav.items.quote },
    { href: "#network", label: m.homeSectionNav.items.network },
    { href: "#ecosystem", label: m.homeSectionNav.items.ecosystem },
    { href: "#insights", label: m.homeSectionNav.items.insights },
    { href: `/${locale}/about#purpose`, label: m.homeSectionNav.items.purpose },
    { href: `/${locale}/contact`, label: m.homeSectionNav.items.contact },
  ];

  return (
    <main id="main-content">
      <div className="full-width-brand-banner">
        <Image
          src="/images/leopard-brand-banner.jpg"
          alt={m.brandBanner.alt}
          width={1376}
          height={768}
          sizes="(max-width: 1032px) calc(100vw - 32px), 1000px"
          priority
        />
      </div>
      <nav className="container home-section-nav" aria-labelledby="home-section-nav-title">
        <h2 className="home-section-nav-heading" id="home-section-nav-title">
          {m.homeSectionNav.title}
        </h2>
        <div className="home-section-nav-items">
          {sectionLinks.map((item) => (
            <Link className="section-nav-button" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <section className="hero-section" id="home-intro">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-rule" />
              {m.hero.eyebrow}
            </p>
            <h1 className="visually-hidden">
              {m.brand.name} — {m.brand.descriptor}
            </h1>
            <p className="hero-description">{m.hero.description}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href={`/${locale}/quote`}>
                {m.hero.primary}
                <CtaArrow size={17} aria-hidden="true" />
              </Link>
              <Link className="button button-outline" href={`/${locale}/services`}>
                {m.hero.secondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-strip" id="approach" aria-label={m.proof.title}>
        <div className="container proof-inner">
          <h2>{m.proof.title}</h2>
          <ul>
            {m.proof.items.map((item) => (
              <li key={item}>
                <span className="check-mark">
                  <Check size={14} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-services" id="services">
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">{m.services.eyebrow}</p>
              <h2>{m.services.title}</h2>
            </div>
            <p className="section-intro">{m.services.intro}</p>
          </div>
          <div className="service-grid">
            {m.services.items.map((service, index) => {
              const Icon = serviceIcons[index] ?? Box;
              return (
                <article className="service-card" key={service.key}>
                  <div className="service-icon">
                    <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
                  </div>
                  <div className="service-card-title-row">
                    <h3>{service.title}</h3>
                    <span className="card-index">0{index + 1}</span>
                  </div>
                  <p>{service.body}</p>
                  <Link className="text-link" href={`/${locale}/services#${service.key}`}>
                    {m.common.learnMore}
                    <CtaArrow size={15} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-why" id="why-leopard">
        <div className="container why-layout">
          <div className="why-aside">
            <p className="eyebrow eyebrow-light">{m.why.eyebrow}</p>
            <h2>{m.why.title}</h2>
            <p>{m.why.intro}</p>
            <Link className="button button-gold" href={`/${locale}/about`}>
              {m.nav.about}
              <CtaArrow size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="why-list">
            {m.why.items.map((item, index) => (
              <article className="why-item" key={item.title}>
                <span className="why-number">0{index + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
                <span className="why-check">
                  <Check size={17} aria-hidden="true" />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section process-section" id="process">
        <div className="container">
          <div className="section-heading process-heading">
            <div>
              <p className="eyebrow">{m.process.eyebrow}</p>
              <h2>{m.process.title}</h2>
            </div>
            <p className="section-intro">{m.process.intro}</p>
          </div>
          <div className="process-grid">
            {m.process.steps.map((step, index) => {
              const Icon = stepsIcons[index] ?? Check;
              return (
                <article className="process-step" key={step.title}>
                  <div className="process-step-top">
                    <span className="step-number">0{index + 1}</span>
                    <span className="process-icon">
                      <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                    </span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  {index < m.process.steps.length - 1 ? (
                    <span className="step-connector" aria-hidden="true" />
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="quote-band" id="quote">
        <div className="container quote-band-inner">
          <div>
            <p className="eyebrow eyebrow-light">{m.quoteBand.eyebrow}</p>
            <h2>{m.quoteBand.title}</h2>
            <p>{m.quoteBand.body}</p>
          </div>
          <div className="quote-band-action">
            <Link className="button button-gold" href={`/${locale}/quote`}>
              {m.common.requestQuote}
              <CtaArrow size={17} aria-hidden="true" />
            </Link>
            <small>{m.quoteBand.note}</small>
          </div>
        </div>
      </section>

      <section className="section network-section" id="network">
        <div className="container network-grid">
          <div className="network-visual" aria-hidden="true">
            <svg className="route-map" viewBox="0 0 560 390" fill="none">
              <path
                d="M39 278c73-25 78-101 141-113 60-11 73 54 135 18 36-21 49-79 112-92 37-8 56 3 94-20"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeDasharray="4 9"
              />
              <path
                d="M82 88c44 25 59 94 120 104 42 7 80-32 122-6 40 25 23 80 71 102 34 15 72 3 103 25"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="3 10"
                opacity=".55"
              />
              <circle cx="180" cy="165" r="9" fill="var(--gold)" />
              <circle cx="315" cy="183" r="7" fill="var(--ocean)" />
              <circle cx="427" cy="91" r="10" fill="var(--gold)" />
              <circle cx="395" cy="288" r="7" fill="var(--ocean)" />
              <circle cx="180" cy="165" r="19" stroke="var(--gold)" strokeOpacity=".25" />
              <circle cx="427" cy="91" r="20" stroke="var(--gold)" strokeOpacity=".25" />
            </svg>
            <div className="network-visual-label">
              <Globe2 size={18} aria-hidden="true" />
              {m.network.badge}
            </div>
            <span className="network-coordinate network-coordinate-one">{m.hero.originLabel}</span>
            <span className="network-coordinate network-coordinate-two">
              {m.hero.destinationLabel}
            </span>
          </div>
          <div className="network-copy">
            <p className="eyebrow">{m.network.eyebrow}</p>
            <h2>{m.network.title}</h2>
            <p>{m.network.body}</p>
            <Link className="text-link" href={`/${locale}/quote`}>
              {m.network.cta}
              <CtaArrow size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-modules" id="ecosystem">
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">{m.ecosystem.eyebrow}</p>
              <h2>{m.ecosystem.title}</h2>
            </div>
            <p className="section-intro">{m.ecosystem.intro}</p>
          </div>
          <div className="module-grid">
            <ModuleCard
              locale={locale}
              title={m.modules.feed.title}
              eyebrow={m.modules.feed.eyebrow}
              body={m.modules.feed.body}
              cta={m.modules.feed.cta}
              label={m.modules.feed.label}
              href={`/${locale}/feed-hub`}
              symbol="F"
            />
            <ModuleCard
              locale={locale}
              title={m.modules.academy.title}
              eyebrow={m.modules.academy.eyebrow}
              body={m.modules.academy.body}
              cta={m.modules.academy.cta}
              label={m.modules.academy.label}
              href={`/${locale}/academy`}
              symbol="A"
            />
            <ModuleCard
              locale={locale}
              title={m.modules.index.title}
              eyebrow={m.modules.index.eyebrow}
              body={m.modules.index.body}
              cta={m.modules.index.cta}
              label={m.modules.index.label}
              href={`/${locale}/index-logistics`}
              symbol="I"
            />
          </div>
        </div>
      </section>

      <section className="section insights-section" id="insights">
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">{m.insights.eyebrow}</p>
              <h2>{m.insights.title}</h2>
            </div>
            <p className="section-intro">{m.insights.intro}</p>
          </div>
          <div className="insights-grid">
            {m.insights.items.map((item, index) => (
              <article className="insight-card" key={item.title}>
                <div className="insight-meta">
                  <span>0{index + 1}</span>
                  <span>{m.insights.category}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <Link className="text-link" href={`/${locale}/services`}>
                  {m.common.readMore}
                  <CtaArrow size={15} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
          <p className="section-disclaimer">{m.insights.disclaimer}</p>
        </div>
      </section>
    </main>
  );
}

function ModuleCard({
  locale,
  title,
  eyebrow,
  body,
  cta,
  label,
  href,
  symbol,
}: {
  locale: Locale;
  title: string;
  eyebrow: string;
  body: string;
  cta: string;
  label: string;
  href: string;
  symbol: string;
}) {
  const DirectionalArrow = locale === "ar" ? ArrowDownLeft : ArrowDownRight;
  return (
    <article className="module-card">
      <div className="module-card-top">
        <span className="module-symbol">{symbol}</span>
        <span className="module-label">{label}</span>
      </div>
      <p className="eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <p className="module-body">{body}</p>
      <Link className="text-link" href={href}>
        {cta}
        <DirectionalArrow size={15} aria-hidden="true" />
      </Link>
    </article>
  );
}
