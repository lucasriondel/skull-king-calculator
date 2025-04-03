"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleChangeLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center space-x-2 absolute top-4 right-4">
      <Button
        variant={locale === "en" ? "default" : "outline"}
        size="sm"
        onClick={() => handleChangeLocale("en")}
      >
        EN
      </Button>
      <Button
        variant={locale === "fr" ? "default" : "outline"}
        size="sm"
        onClick={() => handleChangeLocale("fr")}
      >
        FR
      </Button>
    </div>
  );
}
