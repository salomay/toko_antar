import { adminAndOwnerOnly, adminOwnerAndStaffOnly } from "@utils/auth-utils";
import { ROUTES } from "@utils/routes";

export const siteSettings = {
  name: "TokoAntar",
  description: "",
  logo: {
    url: "/logo.svg",
    alt: "TokoAntar",
    href: "/",
    width: 128,
    height: 40,
  },
  defaultLanguage: "id-ID",
  author: {
    name: "Media Cipta Teknologi",
    websiteUrl: "https://mediaciptateknologi.com",
    address: "",
  },
  headerLinks: [],
  authorizedLinks: [
    {
      href: ROUTES.PROFILE_UPDATE,
      labelTransKey: "authorized-nav-item-profile",
    },
    {
      href: ROUTES.LOGOUT,
      labelTransKey: "authorized-nav-item-logout",
    },
  ],
  currencyCode: "IDR",
  sidebarLinks: {
    admin: [
      {
        href: ROUTES.DASHBOARD,
        label: "sidebar-nav-item-dashboard",
        icon: "DashboardIcon",
      },
      {
        href: ROUTES.SHOPS,
        label: "sidebar-nav-item-shops",
        icon: "ShopIcon",
      },
      {
        href: ROUTES.USERS,
        label: "Customer",
        icon: "UsersIcon",
      },
      {
        href: ROUTES.ATTRIBUTES,
        label: "sidebar-nav-item-attributes",
        icon: "AttributeIcon",
      },
      {
        href: ROUTES.CATEGORIES,
        label: "sidebar-nav-item-categories",
        icon: "CategoriesIcon",
      },
     
      {
        href: ROUTES.PRODUCTS,
        label: "sidebar-nav-item-products",
        icon: "ProductsIcon",
      },
     
      {
        href: ROUTES.GROUPS,
        label: "sidebar-nav-item-groups",
        icon: "TypesIcon",
      },
     
      {
        href: ROUTES.TAGS,
        label: "sidebar-nav-item-tags",
        icon: "TagIcon",
      },
      {
        href: ROUTES.ORDERS,
        label: "sidebar-nav-item-orders",
        icon: "OrdersIcon",
      },
      {
        href: ROUTES.ORDER_STATUS,
        label: "sidebar-nav-item-order-status",
        icon: "OrdersStatusIcon",
      },
      {
        href: ROUTES.COUPONS,
        label: "sidebar-nav-item-coupons",
        icon: "CouponsIcon",
      },
      {
        href: ROUTES.TAXES,
        label: "sidebar-nav-item-taxes",
        icon: "TaxesIcon",
      },
      {
        href: ROUTES.REFUNDS,
        label: "sidebar-nav-item-refunds",
        icon: "RefundsIcon",
      },
      {
        href: ROUTES.SETTINGS,
        label: "sidebar-nav-item-settings",
        icon: "SettingsIcon",
      },
    ],
    shop: [
      {
        href: (shop: string) => `${ROUTES.DASHBOARD}${shop}`,
        label: "sidebar-nav-item-dashboard",
        icon: "DashboardIcon",
        permissions: adminOwnerAndStaffOnly,
      },
      {
        href: (shop: string) => `/${shop}${ROUTES.ATTRIBUTES}`,
        label: "sidebar-nav-item-attributes",
        icon: "AttributeIcon",
        permissions: adminOwnerAndStaffOnly,
      },
      {
        href: (shop: string) => `/${shop}${ROUTES.PRODUCTS}`,
        label: "sidebar-nav-item-products",
        icon: "ProductsIcon",
        permissions: adminOwnerAndStaffOnly,
      },
      {
        href: (shop: string) => `/${shop}${ROUTES.ORDERS}`,
        label: "sidebar-nav-item-orders",
        icon: "OrdersIcon",
        permissions: adminOwnerAndStaffOnly,
      },
      {
        href: (shop: string) => `/${shop}${ROUTES.REFUNDS}`,
        label: "sidebar-nav-item-refunds",
        icon: "RefundsIcon",
        permissions: adminOwnerAndStaffOnly,
      },
      {
        href: (shop: string) => `/${shop}${ROUTES.STAFFS}`,
        label: "sidebar-nav-item-staffs",
        icon: "UsersIcon",
        permissions: adminAndOwnerOnly,
      },
      {
        href: (shop: string) => `/${shop}${ROUTES.WITHDRAWS}`,
        label: "sidebar-nav-item-withdraws",
        icon: "AttributeIcon",
        permissions: adminAndOwnerOnly,
      },
    ],
  },
  product: {
    placeholder: "/product-placeholder.svg",
  },
  avatar: {
    placeholder: "/avatar-placeholder.svg",
  },
};
