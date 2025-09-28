import { type PropsWithChildren, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function RTLProvider({ children }: PropsWithChildren): JSX.Element {
  const { i18n } = useTranslation();

  useEffect(() => {
    const direction = i18n.dir();
    const { documentElement } = document;
    documentElement.dir = direction;
    documentElement.lang = i18n.language;
  }, [i18n, i18n.language]);

  return <>{children}</>;
}
