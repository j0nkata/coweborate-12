"use client";

import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CustomCursor } from "@/components/ui/CustomCursor";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const MENU_ITEMS = [
  { label: "НАЧАЛО", href: "/" },
  { label: "РАБОТА", href: "/work" },
  { label: "УСЛУГИ", href: "/services" },
  { label: "ЗА НАС", href: "/about" },
  { label: "КОНТАКТ", href: "/contact" },
] as const;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef(true);
  const initializedRef = useRef(false);
  const hasOpenedRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const navigationTweenRef = useRef<gsap.core.Tween | null>(null);

  const closeMenu = (returnFocus = true) => {
    returnFocusRef.current = returnFocus;
    setIsOpen(false);
  };

  const handleMenuNavigation = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();

    if (isNavigatingRef.current) return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    const links = Array.from(
      overlay.querySelectorAll<HTMLElement>(".fullscreen-menu-link"),
    );
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    isNavigatingRef.current = true;
    returnFocusRef.current = false;
    setIsNavigating(true);
    gsap.killTweensOf([overlay, ...links]);

    const finishNavigation = () => {
      gsap.set(overlay, {
        yPercent: 100,
        visibility: "hidden",
        pointerEvents: "none",
      });
      gsap.set(links, { y: 28 });
      hasOpenedRef.current = false;
      isNavigatingRef.current = false;
      navigationTweenRef.current = null;
      setIsOpen(false);
      setIsNavigating(false);
      router.push(href);
    };

    if (reducedMotion) {
      finishNavigation();
      return;
    }

    navigationTweenRef.current = gsap.to(overlay, {
      yPercent: 100,
      duration: 0.75,
      ease: "power3.inOut",
      onComplete: finishNavigation,
    });
  };

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const links = Array.from(
      overlay.querySelectorAll<HTMLElement>(".fullscreen-menu-link"),
    );
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    gsap.killTweensOf([overlay, ...links]);

    if (!initializedRef.current) {
      gsap.set(overlay, {
        yPercent: 100,
        visibility: "hidden",
        pointerEvents: "none",
      });
      gsap.set(links, { y: 28 });
      initializedRef.current = true;
    }

    if (isOpen) {
      hasOpenedRef.current = true;
      gsap.set(overlay, {
        visibility: "visible",
        pointerEvents: "auto",
      });
      gsap.set(links, { y: reducedMotion ? 0 : 28 });

      if (reducedMotion) {
        gsap.set(overlay, { yPercent: 0 });
        return;
      }

      const panelTween = gsap.to(overlay, {
        yPercent: 0,
        duration: 0.85,
        ease: "power3.inOut",
      });
      const linksTween = gsap.to(links, {
        y: 0,
        duration: 0.42,
        stagger: 0.055,
        delay: 0.58,
        ease: "power3.out",
      });

      return () => {
        panelTween.kill();
        linksTween.kill();
      };
    }

    if (!hasOpenedRef.current) return;

    const finishClosing = () => {
      gsap.set(overlay, {
        yPercent: 100,
        visibility: "hidden",
        pointerEvents: "none",
      });
      gsap.set(links, { y: 28 });
      if (returnFocusRef.current) {
        toggleRef.current?.focus({ preventScroll: true });
      }
    };

    if (reducedMotion) {
      finishClosing();
      return;
    }

    const panelTween = gsap.to(overlay, {
      yPercent: 100,
      duration: 0.7,
      ease: "power3.inOut",
      onComplete: finishClosing,
    });

    return () => panelTween.kill();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const header = headerRef.current;
    const parent = header?.parentElement;
    const siblings = parent
      ? Array.from(parent.children).filter(
          (element): element is HTMLElement =>
            element instanceof HTMLElement && element !== header,
        )
      : [];
    const previousSiblingState = siblings.map((element) => ({
      element,
      inert: element.inert,
    }));
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;

    siblings.forEach((element) => {
      element.inert = true;
    });
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    const focusTimer = window.setTimeout(() => {
      overlayRef.current
        ?.querySelector<HTMLElement>(".fullscreen-menu-link")
        ?.focus({ preventScroll: true });
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (isNavigatingRef.current) return;
        closeMenu();
        return;
      }

      if (event.key !== "Tab" || !header) return;

      const focusable = Array.from(
        header.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true" &&
          element.getClientRects().length > 0,
      );

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !header.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !header.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      previousSiblingState.forEach(({ element, inert }) => {
        element.inert = inert;
      });
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
    };
  }, [isOpen]);

  useEffect(
    () => () => {
      navigationTweenRef.current?.kill();
    },
    [],
  );

  return (
    <>
      <div className="navigation-flow-space" aria-hidden="true" />
      <header
        className={`site-header${isOpen ? " is-open" : ""}`}
        ref={headerRef}
      >
        <nav
          className="fullscreen-menu"
          id="fullscreen-menu"
          ref={overlayRef}
          aria-label="Основна навигация"
          aria-hidden={!isOpen}
          data-cursor-theme="dark"
          inert={!isOpen}
        >
          <div className="fullscreen-menu-inner">
            <div className="fullscreen-menu-links">
              {MENU_ITEMS.map((item) => (
                <Link
                  className="fullscreen-menu-link"
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  aria-disabled={isNavigating || undefined}
                  onClick={(event) => handleMenuNavigation(event, item.href)}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <nav
          className="bottom-navigation"
          aria-label="Глобална навигация"
          data-cursor-theme="dark"
        >
          <div className="bottom-navigation__inner">
            <Link
              className="bottom-navigation-brand"
              href="/"
              aria-label="COWEBORATE — начало"
              onClick={() => {
                if (isOpen) closeMenu(false);
              }}
            >
              <Image
                className="bottom-navigation-logo"
                src="/logo-menu-new.svg"
                alt="COWEBORATE"
                width={807}
                height={110}
                priority
                unoptimized
              />
            </Link>

            <button
              className="bottom-menu-toggle"
              ref={toggleRef}
              type="button"
              aria-label={isOpen ? "Затвори менюто" : "Отвори менюто"}
              aria-expanded={isOpen}
              aria-controls="fullscreen-menu"
              disabled={isNavigating}
              onClick={() => {
                returnFocusRef.current = true;
                setIsOpen((current) => !current);
              }}
            >
              <span className="bottom-menu-icon" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </button>
          </div>
        </nav>

        <CustomCursor />
      </header>
    </>
  );
}
