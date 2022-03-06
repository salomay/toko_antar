import { ROUTES } from '@lib/routes';
export const siteSettings = {
  name: 'PickBazar',
  description: '',
  logo: {
    url: '/logo.svg',
    alt: 'PickBazar',
    href: '/grocery',
    width: 128,
    height: 40,
  },
  defaultLanguage: 'en',
  currencyCode: 'USD',
  product: {
    placeholderImage: '/product-placeholder.svg',
    cardMaps: {
      grocery: 'Krypton',
      furniture: 'Radon',
      bag: 'Oganesson',
      makeup: 'Neon',
      book: 'Xenon',
      medicine: 'Helium',
      default: 'Argon',
    },
  },
  authorizedLinks: [
    { href: ROUTES.PROFILE, label: 'auth-menu-profile' },
    { href: ROUTES.ORDERS, label: 'auth-menu-my-orders' },
    { href: ROUTES.CHECKOUT, label: 'auth-menu-checkout' },
    { href: ROUTES.LOGOUT, label: 'auth-menu-logout' },
  ],
  authorizedLinksMobile: [
    { href: ROUTES.PROFILE, label: 'auth-menu-profile' },
    { href: ROUTES.ORDERS, label: 'auth-menu-my-orders' },
    { href: ROUTES.REFUNDS, label: 'text-my-refunds' },
    { href: ROUTES.CHECKOUT, label: 'auth-menu-checkout' },
    { href: ROUTES.CHANGE_PASSWORD, label: 'profile-sidebar-password' },
    { href: ROUTES.LOGOUT, label: 'auth-menu-logout' },
  ],
  dashboardSidebarMenu: [
    {
      href: ROUTES.PROFILE,
      label: 'profile-sidebar-profile',
    },
    {
      href: ROUTES.CHANGE_PASSWORD,
      label: 'profile-sidebar-password',
    },
    {
      href: ROUTES.ORDERS,
      label: 'profile-sidebar-orders',
    },
    {
      href: ROUTES.REFUNDS,
      label: 'text-my-refunds',
    },
    {
      href: ROUTES.HELP,
      label: 'profile-sidebar-help',
    },
    {
      href: ROUTES.LOGOUT,
      label: 'profile-sidebar-logout',
    },
  ],
};
