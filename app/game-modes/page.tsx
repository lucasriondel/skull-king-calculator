import { redirect } from "@/src/i18n/navigation";
import { routing } from "@/src/i18n/routing";

export default function GameModesPageRedirect() {
  redirect({ href: "/game-modes", locale: routing.defaultLocale });
}
