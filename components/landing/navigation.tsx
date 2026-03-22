"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X } from "lucide-react";
import { DEVELOPER_DOC_LINKS, PRIMARY_NAV_LINKS } from "@/lib/site";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDeveloperMenuOpen, setIsDeveloperMenuOpen] = useState(false);
  const pathname = usePathname();
  const developerMenuRef = useRef<HTMLDivElement | null>(null);

  const resolveHomeHref = (hash?: string) => {
    if (!hash) return pathname === "/" ? "#top" : "/";
    if (hash.startsWith("/")) return hash;
    return pathname === "/" ? hash : `/${hash}`;
  };

  const isDeveloperRoute =
    pathname === "/docs" || pathname.startsWith("/docs/");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        developerMenuRef.current &&
        !developerMenuRef.current.contains(event.target as Node)
      ) {
        setIsDeveloperMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDeveloperMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled 
          ? "top-4 left-4 right-4" 
          : "top-0 left-0 right-0"
      }`}
    >
      <nav 
        className={`mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-lg max-w-[1200px]"
            : "bg-transparent max-w-[1400px]"
        }`}
      >
        <div 
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? "h-14" : "h-20"
          }`}
        >
          {/* Logo */}
            <Link
              href={resolveHomeHref()}
              className="flex items-center gap-2 group"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className={`font-display tracking-tight transition-all duration-500 ${isScrolled ? "text-xl" : "text-2xl"}`}>TrustSignal</span>
            </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {PRIMARY_NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={resolveHomeHref(link.href)}
                className="relative whitespace-nowrap text-sm text-foreground/70 transition-colors duration-300 hover:text-foreground group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}

            <div
              ref={developerMenuRef}
              className="relative pb-4 -mb-4"
              onMouseEnter={() => setIsDeveloperMenuOpen(true)}
              onMouseLeave={() => setIsDeveloperMenuOpen(false)}
            >
              <button
                type="button"
                className={`relative inline-flex items-center gap-1 whitespace-nowrap text-sm transition-colors duration-300 ${
                  isDeveloperRoute || isDeveloperMenuOpen
                    ? "text-foreground"
                    : "text-foreground/70 hover:text-foreground"
                }`}
                aria-expanded={isDeveloperMenuOpen}
                aria-haspopup="menu"
                onClick={() => setIsDeveloperMenuOpen((open) => !open)}
              >
                Developer Docs
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isDeveloperMenuOpen ? "rotate-180" : ""
                  }`}
                />
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
                    isDeveloperRoute || isDeveloperMenuOpen ? "w-full" : "w-0"
                  }`}
                />
              </button>

              {isDeveloperMenuOpen ? (
                <div className="absolute right-0 top-full z-50 w-[22rem] overflow-hidden rounded-2xl border border-foreground/10 bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
                  <div className="border-b border-foreground/10 px-3 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Developer Docs
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Jump directly into the public TrustSignal developer documentation.
                    </p>
                  </div>

                  <div className="grid gap-1 p-2">
                    {DEVELOPER_DOC_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-xl px-3 py-3 transition-colors hover:bg-muted/60"
                        onClick={() => setIsDeveloperMenuOpen(false)}
                      >
                        <p className="text-sm font-medium text-foreground">
                          {link.name}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {link.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              asChild
              size="sm"
              className={`bg-foreground hover:bg-foreground/90 text-background rounded-full transition-all duration-500 ${isScrolled ? "px-4 h-8 text-xs" : "px-6"}`}
            >
              <Link href={resolveHomeHref("#pilot-request")}>Request Pilot</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

      </nav>
      
      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-background z-40 transition-all duration-500 ${
          isMobileMenuOpen 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        }`}
        style={{ top: 0 }}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          {/* Navigation Links */}
          <div className="flex-1 flex flex-col justify-center gap-8">
            {PRIMARY_NAV_LINKS.map((link, i) => (
              <Link
                key={link.name}
                href={resolveHomeHref(link.href)}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-5xl font-display text-foreground hover:text-muted-foreground transition-all duration-500 ${
                  isMobileMenuOpen 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms" }}
              >
                {link.name}
              </Link>
            ))}

            <div
              className={`transition-all duration-500 ${
                isMobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{
                transitionDelay: isMobileMenuOpen
                  ? `${PRIMARY_NAV_LINKS.length * 75}ms`
                  : "0ms",
              }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Developer Docs
              </p>
              <div className="mt-4 space-y-3">
                {DEVELOPER_DOC_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-5 py-4"
                  >
                    <p className="text-lg font-medium text-foreground">{link.name}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {link.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Bottom CTAs */}
          <div className={`flex gap-4 pt-8 border-t border-foreground/10 transition-all duration-500 ${
            isMobileMenuOpen 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: isMobileMenuOpen ? "300ms" : "0ms" }}
          >
            <Button 
              asChild
              className="flex-1 bg-foreground text-background rounded-full h-14 text-base"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Link href={resolveHomeHref("#pilot-request")}>Request Pilot</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
