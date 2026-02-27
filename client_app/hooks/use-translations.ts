import translationsJson from "@/assets/translations.json";

type Translations = Record<string, Record<string, string>>;

const translations = translationsJson as Translations;

export function useTranslations(locale = "pl") {
  const translate = (key: string) => {
    return translations[locale]?.[key] ?? translations["pl"]?.[key] ?? key;
  };

  return translate;
}
