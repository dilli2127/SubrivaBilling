import { useTranslation as useTranslationI18n } from "react-i18next";

export const useTranslation = () => {
  const { t, i18n } = useTranslationI18n();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return {
    t,
    changeLanguage,
  };
};
