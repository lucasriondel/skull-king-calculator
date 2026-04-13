import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
  defaultLocale,
  supportedLocales,
  type SupportedLocale,
} from "@/src/i18n/locales";
import i18n from "@/src/i18n";

export const Route = createFileRoute("/$locale")({
  beforeLoad: ({ params: { locale } }) => {
    if (!supportedLocales.includes(locale as SupportedLocale)) {
      throw redirect({
        to: "/$locale/game-modes",
        params: { locale: defaultLocale },
      });
    }
    i18n.changeLanguage(locale);
  },
  component: () => <Outlet />,
});
