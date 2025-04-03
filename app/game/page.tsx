import { redirect } from "@/src/i18n/navigation";
import { routing } from "@/src/i18n/routing";

export default function GamePageRedirect() {
  redirect({ href: "/game", locale: routing.defaultLocale });
}
