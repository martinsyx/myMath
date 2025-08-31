import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'zh'];

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as string)) {
    // Instead of calling notFound(), we'll return the default locale messages
    return {
      locale: 'en',
      messages: (await import(`./messages/en.json`)).default
    };
  }

  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

export function getStaticParams() {
  return locales.map((locale) => ({locale}));
}
