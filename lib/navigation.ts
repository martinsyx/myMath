import { useTranslations } from 'next-intl';

export function useNavigation() {
  const t = useTranslations('Navigation');

  const navigationItems = [
    { name: t('home'), href: '/' },
    { name: t('numberSense'), href: '/number-sense' },
    { name: t('addition'), href: '/addition' },
    { name: t('about'), href: '/about' },
    { name: t('contact'), href: '/contact' },
    { name: t('privacy'), href: '/privacy' },
    { name: t('terms'), href: '/terms' },
  ];

  return { navigationItems };
}
