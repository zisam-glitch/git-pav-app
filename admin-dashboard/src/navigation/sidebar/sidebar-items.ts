import {
  Activity,
  Boxes,
  Calendar,
  CalendarClock,
  Clock,
  FileText,
  Folder,
  Forklift,
  Gift,
  History,
  Inbox,
  LayoutDashboard,
  type LucideIcon,
  Mail,
  MessagesSquare,
  ShieldCheck,
  Pill,
  Smartphone,
  ReceiptText,
  ShoppingBag,
  Stethoscope,
  Tag,
  Truck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";

export type NavBadge = "new" | "soon";

export interface NavSubItem {
  id: string;
  title: string;
  url: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

interface NavItemBase {
  id: string;
  title: string;
  icon?: LucideIcon;
  badge?: NavBadge;
  disabled?: boolean;
  newTab?: boolean;
}

export interface NavMainLinkItem extends NavItemBase {
  url: string;
  subItems?: never;
}

export interface NavMainParentItem extends NavItemBase {
  subItems: NavSubItem[];
}

export type NavMainItem = NavMainLinkItem | NavMainParentItem;

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 0,
    label: "Operations",
    items: [
      {
        id: "pav-overview",
        title: "Overview",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "pav-bookings",
        title: "Website Requests",
        url: "/dashboard/bookings",
        icon: Calendar,
      },
      {
        id: "pav-app-appointments",
        title: "App Appointments",
        url: "/dashboard/app-appointments",
        icon: Smartphone,
      },
      {
        id: "pav-opening-hours",
        title: "Opening Hours",
        url: "/dashboard/opening-hours",
        icon: Clock,
      },
      {
        id: "pav-rota",
        title: "Rota",
        url: "/dashboard/rota",
        icon: CalendarClock,
      },
      {
        id: "pav-team",
        title: "Team & Services",
        url: "/dashboard/team",
        icon: UserPlus,
      },
      {
        id: "pav-vans",
        title: "Vans & Service Areas",
        url: "/dashboard/vans",
        icon: Truck,
      },
      {
        id: "pav-van-shifts",
        title: "Van Shifts",
        url: "/dashboard/van-shifts",
        icon: Activity,
      },
      {
        id: "pav-dentist-profiles",
        title: "Dentist Profiles",
        url: "/dashboard/dentist-profiles",
        icon: Stethoscope,
      },
      {
        id: "pav-inbox",
        title: "Patient Inbox",
        url: "/dashboard/inbox",
        icon: MessagesSquare,
      },
      {
        id: "pav-submissions",
        title: "Form Submissions",
        url: "/dashboard/submissions",
        icon: Inbox,
      },
    ],
  },
  {
    id: 1,
    label: "Patients & Compliance",
    items: [
      {
        id: "pav-patients",
        title: "Patients",
        url: "/dashboard/patients",
        icon: Users,
      },
      {
        id: "pav-referral-vouchers",
        title: "Referral Vouchers",
        url: "/dashboard/referral-vouchers",
        icon: Gift,
      },
      {
        id: "pav-erasure",
        title: "Erasure Requests",
        url: "/dashboard/erasure-requests",
        icon: UserX,
      },
      {
        id: "pav-privacy-records",
        title: "Consent & Access",
        url: "/dashboard/privacy-records",
        icon: ShieldCheck,
      },
      {
        id: "pav-prescriptions",
        title: "Prescriptions",
        url: "/dashboard/prescriptions",
        icon: Pill,
      },
      {
        id: "pav-audit-log",
        title: "Audit Log",
        url: "/dashboard/audit-log",
        icon: History,
      },
    ],
  },
  {
    id: 2,
    label: "Shop & Products",
    items: [
      {
        id: "pav-products",
        title: "Products",
        url: "/dashboard/products",
        icon: ShoppingBag,
      },
      {
        id: "pav-categories",
        title: "Categories",
        url: "/dashboard/categories",
        icon: Folder,
      },
      {
        id: "pav-orders",
        title: "Orders",
        url: "/dashboard/orders",
        icon: ReceiptText,
      },
      {
        id: "pav-inventory",
        title: "Inventory",
        url: "/dashboard/inventory",
        icon: Boxes,
      },
      {
        id: "pav-discounts",
        title: "Discounts",
        url: "/dashboard/discounts",
        icon: Tag,
      },
      {
        id: "pav-shipping",
        title: "Shipping",
        url: "/dashboard/shipping",
        icon: Forklift,
      },
    ],
  },
  {
    id: 3,
    label: "Content & Marketing",
    items: [
      {
        id: "pav-blogs",
        title: "Blog Posts",
        url: "/dashboard/blogs",
        icon: FileText,
      },
      {
        id: "pav-pricing",
        title: "Pricing Editor",
        url: "/dashboard/pricing",
        icon: Tag,
      },
      {
        id: "pav-newsletter",
        title: "Newsletter",
        url: "/dashboard/newsletter",
        icon: Mail,
      },
    ],
  },
];
