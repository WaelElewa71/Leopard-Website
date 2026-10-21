"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, LoaderCircle } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { getMessages, type Locale } from "@/i18n/messages";
import {
  rfqContactSchema,
  rfqDetailsSchema,
  rfqRequestSchema,
  rfqRouteSchema,
  type RfqRequest,
} from "../schemas/rfq-schema";

type SubmissionResult = { reference: string };
type ApiError = { error?: string };

export function QuoteForm({ locale, source }: { locale: Locale; source: "website" | "feed-hub" }) {
  const m = getMessages(locale);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isArabic = locale === "ar";
  const BackIcon = isArabic ? ArrowRight : ArrowLeft;
  const NextIcon = isArabic ? ArrowLeft : ArrowRight;

  const form = useForm<RfqRequest>({
    resolver: zodResolver(rfqRequestSchema),
    mode: "onTouched",
    shouldUnregister: false,
  });

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = form;

  const mode = useWatch({ control: form.control, name: "mode" });
  const loadType = useWatch({ control: form.control, name: "loadType" });

  function messageForError(error: unknown): string | undefined {
    if (!error || typeof error !== "object" || !("message" in error)) return undefined;
    const message = String(error.message);
    const localized = m.quote.errors[message as keyof typeof m.quote.errors];
    return localized ?? m.quote.errors.invalid;
  }

  function fieldError(name: FieldPath<RfqRequest>): string | undefined {
    return messageForError(errors[name]?.message ? { message: errors[name]?.message } : undefined);
  }

  function applyIssues(issues: { path: PropertyKey[]; message: string }[]) {
    clearErrors();
    for (const issue of issues) {
      const field = issue.path[0];
      if (typeof field === "string") {
        setError(field as FieldPath<RfqRequest>, { type: "manual", message: issue.message });
      }
    }
  }

  function continueStep() {
    clearErrors();
    const values = getValues();
    const parsed =
      step === 0 ? rfqContactSchema.safeParse(values) : rfqRouteSchema.safeParse(values);

    if (!parsed.success) {
      applyIssues(parsed.error.issues);
      return;
    }
    setSubmitError(null);
    setStep((current) => Math.min(current + 1, 2));
  }

  function validateDetails(): boolean {
    const values = getValues();
    const parsed = rfqDetailsSchema.safeParse({
      mode: values.mode,
      originPort: values.originPort,
      destinationPort: values.destinationPort,
      hsCode: values.hsCode,
      volumeCbm: values.volumeCbm,
      lengthCm: values.lengthCm,
      widthCm: values.widthCm,
      heightCm: values.heightCm,
      cargoReadyDate: values.cargoReadyDate,
      dangerousGoods: values.dangerousGoods,
      temperatureControl: values.temperatureControl,
      additionalInstructions: values.additionalInstructions,
      privacyConsent: values.privacyConsent,
      website: values.website,
    });
    if (!parsed.success) {
      applyIssues(parsed.error.issues);
      return false;
    }
    return true;
  }

  async function submitRequest(values: RfqRequest) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const response = await fetch("/api/v1/rfqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ ...values, source }),
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as SubmissionResult & ApiError;
      if (!response.ok) {
        const message =
          payload.error === "rate_limited"
            ? m.quote.errors.rateLimited
            : payload.error === "rfq_service_not_configured" ||
                payload.error === "rfq_service_unavailable"
              ? m.quote.errors.unavailable
              : payload.error === "validation_failed"
                ? m.quote.errors.invalid
                : m.quote.errors.server;
        setSubmitError(message);
        return;
      }
      if (!payload.reference) {
        setSubmitError(m.quote.errors.server);
        return;
      }
      setResult({ reference: payload.reference });
    } catch {
      setSubmitError(m.quote.errors.server);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result) {
    return (
      <section className="rfq-success" aria-live="polite">
        <span className="success-icon">
          <CheckCircle2 size={32} aria-hidden="true" />
        </span>
        <p className="eyebrow">{m.quote.reference}</p>
        <h2>{m.quote.successTitle}</h2>
        <p>{m.quote.successBody}</p>
        <strong className="reference-code" dir="ltr">
          {result.reference}
        </strong>
        <p className="success-note">{m.quote.successNext}</p>
      </section>
    );
  }

  const field = (name: FieldPath<RfqRequest>) => ({
    id: name,
    error: fieldError(name),
    invalid: Boolean(errors[name]),
  });

  return (
    <div className="rfq-form-shell">
      <div className="rfq-stepper" aria-label={m.quote.stepsAccessible}>
        {m.quote.stepLabels.map((label, index) => (
          <div
            className={`rfq-step${index === step ? " is-current" : ""}${index < step ? " is-complete" : ""}`}
            key={label}
          >
            <span className="rfq-step-number">
              {index < step ? <CheckCircle2 size={16} aria-hidden="true" /> : `0${index + 1}`}
            </span>
            <span className="rfq-step-label">{label}</span>
          </div>
        ))}
      </div>

      <form className="rfq-form" noValidate onSubmit={handleSubmit(submitRequest)}>
        {step === 0 ? (
          <fieldset className="form-step">
            <legend>{m.quote.contactHeading}</legend>
            <div className="form-grid">
              <Field label={m.quote.fields.companyName} {...field("companyName")}>
                <input
                  autoComplete="organization"
                  {...register("companyName")}
                  aria-invalid={field("companyName").invalid}
                  aria-describedby={field("companyName").error ? "companyName-error" : undefined}
                />
              </Field>
              <Field label={m.quote.fields.contactName} {...field("contactName")}>
                <input
                  autoComplete="name"
                  {...register("contactName")}
                  aria-invalid={field("contactName").invalid}
                  aria-describedby={field("contactName").error ? "contactName-error" : undefined}
                />
              </Field>
              <Field label={m.quote.fields.email} {...field("email")}>
                <input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  {...register("email")}
                  aria-invalid={field("email").invalid}
                  aria-describedby={field("email").error ? "email-error" : undefined}
                />
              </Field>
              <Field label={m.quote.fields.phone} {...field("phone")}>
                <input
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  {...register("phone")}
                  aria-invalid={field("phone").invalid}
                  aria-describedby={field("phone").error ? "phone-error" : undefined}
                />
              </Field>
              <Field label={m.quote.fields.companyCountry} {...field("companyCountry")}>
                <input
                  autoComplete="country-name"
                  {...register("companyCountry")}
                  aria-invalid={field("companyCountry").invalid}
                  aria-describedby={
                    field("companyCountry").error ? "companyCountry-error" : undefined
                  }
                />
              </Field>
              <Field
                label={m.quote.fields.preferredContactMethod}
                {...field("preferredContactMethod")}
              >
                <SelectShell>
                  <select
                    {...register("preferredContactMethod")}
                    aria-invalid={field("preferredContactMethod").invalid}
                    aria-describedby={
                      field("preferredContactMethod").error
                        ? "preferredContactMethod-error"
                        : undefined
                    }
                  >
                    <option value="">{m.quote.options.select}</option>
                    <option value="EMAIL">{m.quote.options.contact.email}</option>
                    <option value="PHONE">{m.quote.options.contact.phone}</option>
                    <option value="WHATSAPP">{m.quote.options.contact.whatsapp}</option>
                  </select>
                </SelectShell>
              </Field>
            </div>
          </fieldset>
        ) : null}

        {step === 1 ? (
          <fieldset className="form-step">
            <legend>{m.quote.routeHeading}</legend>
            <div className="form-grid">
              <Field label={m.quote.fields.direction} {...field("direction")}>
                <SelectShell>
                  <select
                    {...register("direction")}
                    aria-invalid={field("direction").invalid}
                    aria-describedby={field("direction").error ? "direction-error" : undefined}
                  >
                    <option value="">{m.quote.options.select}</option>
                    <option value="IMPORT">{m.quote.options.direction.IMPORT}</option>
                    <option value="EXPORT">{m.quote.options.direction.EXPORT}</option>
                    <option value="CROSS_TRADE">{m.quote.options.direction.CROSS_TRADE}</option>
                  </select>
                </SelectShell>
              </Field>
              <Field label={m.quote.fields.mode} {...field("mode")}>
                <SelectShell>
                  <select
                    {...register("mode", {
                      onChange: (event) => {
                        const nextMode = event.target.value;
                        if (nextMode !== "SEA") {
                          setValue("loadType", "NOT_APPLICABLE", { shouldValidate: true });
                          setValue("containerType", "");
                        } else {
                          setValue("loadType", "NOT_APPLICABLE", { shouldValidate: true });
                        }
                      },
                    })}
                    aria-invalid={field("mode").invalid}
                    aria-describedby={field("mode").error ? "mode-error" : undefined}
                  >
                    <option value="">{m.quote.options.select}</option>
                    <option value="SEA">{m.quote.options.mode.SEA}</option>
                    <option value="AIR">{m.quote.options.mode.AIR}</option>
                    <option value="LAND">{m.quote.options.mode.LAND}</option>
                  </select>
                </SelectShell>
              </Field>
              <Field label={m.quote.fields.originCountry} {...field("originCountry")}>
                <input
                  autoComplete="country-name"
                  {...register("originCountry")}
                  aria-invalid={field("originCountry").invalid}
                  aria-describedby={
                    field("originCountry").error ? "originCountry-error" : undefined
                  }
                />
              </Field>
              <Field label={m.quote.fields.originLocation} {...field("originLocation")}>
                <input
                  autoComplete="address-level2"
                  {...register("originLocation")}
                  aria-invalid={field("originLocation").invalid}
                  aria-describedby={
                    field("originLocation").error ? "originLocation-error" : undefined
                  }
                />
              </Field>
              <Field label={m.quote.fields.destinationCountry} {...field("destinationCountry")}>
                <input
                  autoComplete="country-name"
                  {...register("destinationCountry")}
                  aria-invalid={field("destinationCountry").invalid}
                  aria-describedby={
                    field("destinationCountry").error ? "destinationCountry-error" : undefined
                  }
                />
              </Field>
              <Field label={m.quote.fields.destinationLocation} {...field("destinationLocation")}>
                <input
                  autoComplete="address-level2"
                  {...register("destinationLocation")}
                  aria-invalid={field("destinationLocation").invalid}
                  aria-describedby={
                    field("destinationLocation").error ? "destinationLocation-error" : undefined
                  }
                />
              </Field>
              {mode === "SEA" ? (
                <>
                  <Field label={m.quote.fields.loadType} {...field("loadType")}>
                    <SelectShell>
                      <select
                        {...register("loadType")}
                        aria-invalid={field("loadType").invalid}
                        aria-describedby={field("loadType").error ? "loadType-error" : undefined}
                      >
                        <option value="NOT_APPLICABLE">{m.quote.options.select}</option>
                        <option value="FCL">{m.quote.options.loadType.FCL}</option>
                        <option value="LCL">{m.quote.options.loadType.LCL}</option>
                      </select>
                    </SelectShell>
                  </Field>
                  {loadType === "FCL" ? (
                    <Field label={m.quote.fields.containerType} {...field("containerType")}>
                      <SelectShell>
                        <select
                          {...register("containerType")}
                          aria-invalid={field("containerType").invalid}
                          aria-describedby={
                            field("containerType").error ? "containerType-error" : undefined
                          }
                        >
                          <option value="">{m.quote.options.select}</option>
                          <option value="20FT">{m.quote.options.container["20FT"]}</option>
                          <option value="40FT">{m.quote.options.container["40FT"]}</option>
                          <option value="40HC">{m.quote.options.container["40HC"]}</option>
                          <option value="OTHER">{m.quote.options.container.OTHER}</option>
                        </select>
                      </SelectShell>
                    </Field>
                  ) : null}
                </>
              ) : null}
              <Field
                label={m.quote.fields.cargoDescription}
                {...field("cargoDescription")}
                className="field-full"
              >
                <textarea
                  rows={3}
                  {...register("cargoDescription")}
                  aria-invalid={field("cargoDescription").invalid}
                  aria-describedby={
                    field("cargoDescription").error ? "cargoDescription-error" : undefined
                  }
                />
              </Field>
              <Field label={m.quote.fields.commodity} {...field("commodity")}>
                <input {...register("commodity")} />
              </Field>
              <Field
                label={m.quote.fields.grossWeightKg}
                hint={m.quote.help.weight}
                {...field("grossWeightKg")}
              >
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  inputMode="decimal"
                  {...register("grossWeightKg", { valueAsNumber: true })}
                  aria-invalid={field("grossWeightKg").invalid}
                  aria-describedby={
                    field("grossWeightKg").error ? "grossWeightKg-error" : "grossWeightKg-hint"
                  }
                />
              </Field>
              <Field label={m.quote.fields.packageCount} {...field("packageCount")}>
                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  {...register("packageCount", { valueAsNumber: true })}
                  aria-invalid={field("packageCount").invalid}
                  aria-describedby={field("packageCount").error ? "packageCount-error" : undefined}
                />
              </Field>
              <Field label={m.quote.fields.packageType} {...field("packageType")}>
                <SelectShell>
                  <select
                    {...register("packageType")}
                    aria-invalid={field("packageType").invalid}
                    aria-describedby={field("packageType").error ? "packageType-error" : undefined}
                  >
                    <option value="">{m.quote.options.select}</option>
                    {m.quote.options.packageType.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </SelectShell>
              </Field>
              <Field label={m.quote.fields.incoterm} {...field("incoterm")}>
                <SelectShell>
                  <select
                    {...register("incoterm")}
                    aria-invalid={field("incoterm").invalid}
                    aria-describedby={field("incoterm").error ? "incoterm-error" : undefined}
                  >
                    <option value="">{m.quote.options.select}</option>
                    {m.quote.options.incoterms.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </SelectShell>
              </Field>
            </div>
          </fieldset>
        ) : null}

        {step === 2 ? (
          <fieldset className="form-step">
            <legend>{m.quote.detailsHeading}</legend>
            <div className="form-grid">
              <Field label={m.quote.fields.originPort} {...field("originPort")}>
                <input {...register("originPort")} />
              </Field>
              <Field label={m.quote.fields.destinationPort} {...field("destinationPort")}>
                <input {...register("destinationPort")} />
              </Field>
              <Field label={m.quote.fields.hsCode} {...field("hsCode")}>
                <input {...register("hsCode")} dir="ltr" />
              </Field>
              <Field label={m.quote.fields.cargoReadyDate} {...field("cargoReadyDate")}>
                <input type="date" {...register("cargoReadyDate")} />
              </Field>
              <Field
                label={m.quote.fields.volumeCbm}
                hint={m.quote.help.dimensions}
                {...field("volumeCbm")}
                className="field-full"
              >
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  inputMode="decimal"
                  {...register("volumeCbm", {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                  aria-invalid={field("volumeCbm").invalid}
                  aria-describedby={field("volumeCbm").error ? "volumeCbm-error" : "volumeCbm-hint"}
                />
              </Field>
              <Field label={m.quote.fields.lengthCm} {...field("lengthCm")}>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  inputMode="decimal"
                  {...register("lengthCm", {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                />
              </Field>
              <Field label={m.quote.fields.widthCm} {...field("widthCm")}>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  inputMode="decimal"
                  {...register("widthCm", {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                />
              </Field>
              <Field label={m.quote.fields.heightCm} {...field("heightCm")}>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  inputMode="decimal"
                  {...register("heightCm", {
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                />
              </Field>
              <div className="checkbox-stack field-full">
                <label className="checkbox-row">
                  <input type="checkbox" {...register("dangerousGoods")} />
                  <span>{m.quote.fields.dangerousGoods}</span>
                </label>
                <label className="checkbox-row">
                  <input type="checkbox" {...register("temperatureControl")} />
                  <span>{m.quote.fields.temperatureControl}</span>
                </label>
              </div>
              <Field
                label={m.quote.fields.instructions}
                {...field("additionalInstructions")}
                className="field-full"
              >
                <textarea rows={3} {...register("additionalInstructions")} />
              </Field>
              <div className="privacy-consent field-full">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    {...register("privacyConsent")}
                    aria-invalid={field("privacyConsent").invalid}
                    aria-describedby={
                      field("privacyConsent").error ? "privacyConsent-error" : undefined
                    }
                  />
                  <span>{m.quote.fields.privacyConsent}</span>
                </label>
                {fieldError("privacyConsent") ? (
                  <p className="field-error" id="privacyConsent-error">
                    {fieldError("privacyConsent")}
                  </p>
                ) : null}
                <p className="privacy-draft-note">{m.quote.privacyDraft}</p>
              </div>
              <div className="honeypot" aria-hidden="true">
                <label htmlFor="website">{m.quote.fields.website}</label>
                <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
              </div>
            </div>
            <p className="form-security-note">{m.quote.help.files}</p>
          </fieldset>
        ) : null}

        {submitError ? (
          <div className="form-alert" role="alert">
            {submitError}
          </div>
        ) : null}

        <div className="form-actions">
          {step > 0 ? (
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                clearErrors();
                setSubmitError(null);
                setStep((current) => current - 1);
              }}
            >
              <BackIcon size={17} aria-hidden="true" />
              {m.common.back}
            </button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <button type="button" className="button button-primary" onClick={continueStep}>
              {m.common.continue}
              <NextIcon size={17} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              className="button button-primary"
              disabled={isSubmitting}
              onClick={(event) => {
                if (!validateDetails()) event.preventDefault();
              }}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle size={17} className="spin" aria-hidden="true" />
                  {m.common.submitting}
                </>
              ) : (
                <>
                  {m.common.submit}
                  <NextIcon size={17} aria-hidden="true" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
      <div className="form-steps-caption" aria-live="polite">
        {m.quote.stepOf} {step + 1} {m.quote.of} {m.quote.stepLabels.length}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`form-field ${className}`}>
      <label className="form-label">
        <span>{label}</span>
        {children}
      </label>
      {hint && !error ? (
        <span className="field-hint" id={`${id}-hint`}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="field-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

function SelectShell({ children }: { children: ReactNode }) {
  return (
    <span className="select-shell">
      {children}
      <ChevronDown size={16} aria-hidden="true" />
    </span>
  );
}
