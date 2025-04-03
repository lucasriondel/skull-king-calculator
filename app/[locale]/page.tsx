import { redirect } from "@/src/i18n/navigation";
import { setRequestLocale } from "next-intl/server";

export default function IndexPage({ params }: { params: { locale: string } }) {
  const { locale } = params;

  // Enable static rendering
  setRequestLocale(locale);

  // Redirect to game-modes page
  redirect({ href: "/game-modes", locale });
}
