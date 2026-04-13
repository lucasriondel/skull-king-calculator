import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { locale } = useParams({ from: "/$locale" });
  const routerState = useRouterState();

  const handleChangeLocale = (newLocale: string) => {
    i18n.changeLanguage(newLocale);
    const currentPath = routerState.location.pathname;
    const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`);
    navigate({ to: newPath });
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={i18n.language === "en" ? "default" : "outline"}
        size="sm"
        onClick={() => handleChangeLocale("en")}
      >
        EN
      </Button>
      <Button
        variant={i18n.language === "fr" ? "default" : "outline"}
        size="sm"
        onClick={() => handleChangeLocale("fr")}
      >
        FR
      </Button>
    </div>
  );
}
