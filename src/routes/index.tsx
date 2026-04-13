import { createFileRoute, redirect } from "@tanstack/react-router";
import { defaultLocale, supportedLocales } from "@/src/i18n/locales";
import type { SupportedLocale } from "@/src/i18n/locales";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const browserLang = navigator.language.split("-")[0] as SupportedLocale;
    const locale = supportedLocales.includes(browserLang)
      ? browserLang
      : defaultLocale;
    throw redirect({ to: "/$locale/game-modes", params: { locale } });
  },
});
