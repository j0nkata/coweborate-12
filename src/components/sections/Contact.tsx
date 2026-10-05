"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Container } from "@/components/layout/Container";
import { loadGsap } from "@/lib/gsapClient";
import styles from "./Contact.module.css";

const SERVICES = ["УЕБСАЙТ", "ОНЛАЙН МАГАЗИН", "БИЗНЕС СИСТЕМА", "УЕБ ДИЗАЙН", "SEO", "ДРУГО"] as const;
const STARTING_POINTS = ["ИМАМ ИДЕЯ", "ИМАМ САЙТ", "ИМАМ ГОТОВ ДИЗАЙН", "ИСКАМ НОВА СИСТЕМА", "НЕ СЪМ СИГУРЕН — НЕКА ПОГОВОРИМ"] as const;
type FieldErrors = Partial<Record<"name" | "email" | "services" | "message", string>>;

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submission, setSubmission] = useState<"idle" | "sending" | "sent" | "unavailable" | "failed">("idle");

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    async function setupMotion() {
      const { gsap, ScrollTrigger } = await loadGsap();
      if (cancelled || !sectionRef.current) return;
      const section = sectionRef.current;
      const context = gsap.context(() => {
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
          const lines = section.querySelectorAll<HTMLElement>("[data-contact-line]");
          const support = section.querySelector<HTMLElement>("[data-contact-support]");
          const groups = section.querySelectorAll<HTMLElement>("[data-contact-group]");
          const action = section.querySelector<HTMLElement>("[data-contact-action]");
          if (!support || !action) return;
          const entrance = gsap.timeline({ paused: true });
          entrance
            .from(lines, { yPercent: 110, duration: 0.68, stagger: 0.1, ease: "power2.out" }, 0)
            .from(support, { autoAlpha: 0, y: 20, duration: 0.55, ease: "power2.out" }, 0.36)
            .from(groups, { autoAlpha: 0, y: 16, duration: 0.5, stagger: 0.09, ease: "power2.out" }, 0.46)
            .from(action, { autoAlpha: 0, y: 16, duration: 0.45, ease: "power2.out" }, 1.12);
          const trigger = ScrollTrigger.create({
            trigger: section,
            start: "top 80%",
            once: true,
            onEnter: () => entrance.play(),
            onRefresh: (self) => { if (self.scroll() >= self.start) entrance.progress(1); },
          });
          return () => { trigger.kill(); entrance.kill(); };
        });
        return () => media.revert();
      }, section);
      cleanup = () => context.revert();
    }
    void setupMotion();
    return () => { cancelled = true; cleanup?.(); };
  }, []);

  function clearError(field: keyof FieldErrors) {
    setErrors((current) => current[field] ? { ...current, [field]: undefined } : current);
    if (submission === "unavailable" || submission === "failed") setSubmission("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submission === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const services = data.getAll("services").map(String);
    const startingPoint = String(data.get("startingPoint") ?? "");
    const message = String(data.get("message") ?? "").trim();
    const emailInput = form.elements.namedItem("email") as HTMLInputElement;
    const nextErrors: FieldErrors = {};
    if (!name) nextErrors.name = "Въведи име.";
    if (!email) nextErrors.email = "Въведи имейл.";
    else if (emailInput.validity.typeMismatch) nextErrors.email = "Въведи валиден имейл.";
    if (!services.length) nextErrors.services = "Избери поне една услуга.";
    if (!message) nextErrors.message = "Разкажи ни накратко за проекта.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      form.querySelector<HTMLElement>(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus();
      return;
    }
    const endpoint = process.env.NEXT_PUBLIC_INQUIRY_ENDPOINT;
    if (!endpoint) { setSubmission("unavailable"); return; }
    setSubmission("sending");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, services, startingPoint, message }),
      });
      if (!response.ok) throw new Error("Inquiry request failed");
      setSubmission("sent");
      form.reset();
    } catch { setSubmission("failed"); }
  }

  return (
    <section className={styles.section} id="contact" aria-labelledby="contact-title" data-cursor-theme="dark" ref={sectionRef}>
      <Container className={styles.layout}>
        <div className={styles.intro}>
          <h2 className={styles.title} id="contact-title">
            <span className={styles.lineMask}><span data-contact-line>РАЗКАЖИ НИ</span></span>
            <span className={styles.lineMask}><span data-contact-line>КАКВО ИСКАШ</span></span>
            <span className={`${styles.lineMask} ${styles.blueLine}`}><span data-contact-line>ДА НАПРАВИМ.</span></span>
          </h2>
          <p className={styles.support} data-contact-support>Сайт, онлайн магазин или система. Опиши ни идеята и ще започнем оттам.</p>
        </div>
        <div className={styles.inquiry}>
          {submission === "sent" ? (
            <div className={styles.success} role="status"><h3>БЛАГОДАРИМ.</h3><p>ЩЕ СЕ СВЪРЖЕМ С ТЕБ СКОРО.</p></div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={`${styles.identity} ${styles.group}`} data-contact-group>
                <div className={styles.field}>
                  <label htmlFor="inquiry-name">ИМЕ <span aria-hidden="true">*</span></label>
                  <input id="inquiry-name" name="name" type="text" autoComplete="name" placeholder="Твоето име" required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "inquiry-name-error" : undefined} onInput={() => clearError("name")} />
                  {errors.name && <span className={styles.error} id="inquiry-name-error">{errors.name}</span>}
                </div>
                <div className={styles.field}>
                  <label htmlFor="inquiry-email">ИМЕЙЛ <span aria-hidden="true">*</span></label>
                  <input id="inquiry-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="email@example.com" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "inquiry-email-error" : undefined} onInput={() => clearError("email")} />
                  {errors.email && <span className={styles.error} id="inquiry-email-error">{errors.email}</span>}
                </div>
              </div>
              <fieldset className={styles.group} data-contact-group aria-invalid={Boolean(errors.services)} aria-describedby={errors.services ? "inquiry-services-error" : undefined}>
                <legend>КАКВО ТИ ТРЯБВА? <span aria-hidden="true">*</span></legend>
                <div className={styles.serviceChoices}>
                  {SERVICES.map((service) => (
                    <label className={styles.choice} key={service}>
                      <input name="services" type="checkbox" value={service} onChange={() => clearError("services")} />
                      <span>{service}</span><span className={styles.choiceMark} aria-hidden="true" />
                    </label>
                  ))}
                </div>
                {errors.services && <span className={styles.error} id="inquiry-services-error">{errors.services}</span>}
              </fieldset>
              <fieldset className={styles.group} data-contact-group>
                <legend>ОТКЪДЕ ЗАПОЧВАМЕ?</legend>
                <div className={styles.startChoices}>
                  {STARTING_POINTS.map((point, index) => (
                    <label className={`${styles.choice} ${index === STARTING_POINTS.length - 1 ? styles.wideChoice : ""}`} key={point}>
                      <input name="startingPoint" type="radio" value={point} />
                      <span>{point}</span><span className={styles.choiceMark} aria-hidden="true" />
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className={`${styles.field} ${styles.group}`} data-contact-group>
                <label htmlFor="inquiry-message">РАЗКАЖИ НИ НАКРАТКО <span aria-hidden="true">*</span></label>
                <textarea id="inquiry-message" name="message" rows={4} placeholder="Няколко изречения за проекта, целта или проблема, който искаш да решим..." required aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "inquiry-message-error" : undefined} onInput={() => clearError("message")} />
                {errors.message && <span className={styles.error} id="inquiry-message-error">{errors.message}</span>}
              </div>
              <div className={styles.action} data-contact-action>
                <button className={styles.submit} type="submit" disabled={submission === "sending"}>
                  <span>{submission === "sending" ? "ИЗПРАЩАНЕ..." : "ИЗПРАТИ ЗАПИТВАНЕ"}</span><span className={styles.arrow} aria-hidden="true">→</span>
                </button>
                {submission === "unavailable" && <p className={styles.submitError} role="status">Онлайн изпращането още не е активно. Запитването не е изпратено.</p>}
                {submission === "failed" && <p className={styles.submitError} role="status">Не успяхме да изпратим запитването. Опитай отново.</p>}
              </div>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
