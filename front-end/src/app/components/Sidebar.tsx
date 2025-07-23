"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// Import lucide-react icons for each section
import {
  Home,
  BookUser,
  MapPin,
  Boxes,
  FileText,
  DollarSign,
  FileBarChart2,
  Truck,
  History,
  Settings,
  Users,
  Shield,
  UploadCloud,
} from "lucide-react";

// Map each section to an icon
const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <Home size={16} className="mr-2" />,
  },
  {
    label: "Address Book",
    href: "/addressbook",
    icon: <BookUser size={16} className="mr-2" />,
  },
  {
    label: "Port & Location",
    icon: <MapPin size={16} className="mr-2" />,
    children: [
      {
        label: "Ports",
        href: "/port-location/ports",
        icon: <MapPin size={14} className="mr-2" />,
      },
      {
        label: "Countries",
        href: "/port-location/countries",
        icon: <MapPin size={14} className="mr-2" />,
      },
      {
        label: "Currency",
        href: "/port-location/currency",
        icon: <DollarSign size={14} className="mr-2" />,
      },
      {
        label: "Exchange Rates",
        href: "/port-location/exchangerates",
        icon: <DollarSign size={14} className="mr-2" />,
      },
    ],
  },
  {
    label: "Products & Inventory",
    icon: <Boxes size={16} className="mr-2" />,
    children: [
      {
        label: "Inventory",
        href: "/products-inventory/inventory",
        icon: <Boxes size={14} className="mr-2" />,
      },
      {
        label: "Products",
        href: "/products-inventory/products",
        icon: <Boxes size={14} className="mr-2" />,
      },
    ],
  },
  {
    label: "Container Lease Tariff",
    href: "/container-lease-tariff",
    icon: <FileText size={16} className="mr-2" />,
  },
  {
    label: "Cost Tariff",
    icon: <DollarSign size={16} className="mr-2" />,
    children: [
      {
        label: "Handling Agent Tariff Cost",
        href: "/cost-tariff/handlingagenttariffcost",
        icon: <DollarSign size={14} className="mr-2" />,
      },
      {
        label: "Land Transport Tariff Cost",
        href: "/cost-tariff/landtransporttariffcost",
        icon: <Truck size={14} className="mr-2" />,
      },
      {
        label: "Depot Avg Tariff Cost",
        href: "/cost-tariff/depotavgtariffcost",
        icon: <FileBarChart2 size={14} className="mr-2" />,
      },
      {
        label: "Depot Cleaning Tariff Cost",
        href: "/cost-tariff/depotcleaningtariffcost",
        icon: <FileBarChart2 size={14} className="mr-2" />,
      },
    ],
  },
  {
    label: "Quotation",
    href: "/quotation",
    icon: <FileText size={16} className="mr-2" />,
  },
  {
    label: "Shipments",
    icon: <Truck size={16} className="mr-2" />,
    children: [
      {
        label: "All Shipments",
        href: "/shipments/allshipments",
        icon: <Truck size={14} className="mr-2" />,
      },
      {
        label: "Empty Repo Job",
        href: "/shipments/emptyrepojob",
        icon: <Truck size={14} className="mr-2" />,
      },
    ],
  },
  {
    label: "Movements History",
    href: "/movements-history",
    icon: <History size={16} className="mr-2" />,
  },
  {
    label: "Settings",
    icon: <Settings size={16} className="mr-2" />,
    children: [
      {
        label: "Users",
        href: "/settings/users",
        icon: <Users size={14} className="mr-2" />,
      },
      {
        label: "Permissions",
        href: "/settings/permissions",
        icon: <Shield size={14} className="mr-2" />,
      },
      {
        label: "Data Import",
        href: "/settings/dataimport",
        icon: <UploadCloud size={14} className="mr-2" />,
      },
    ],
  },
];

// Helper to check if any child is active
function hasActiveChild(item: any, pathname: string) {
  if (!item.children) return false;
  return item.children.some((child: any) => pathname.startsWith(child.href));
}

// Helper to get section title from pathname
function getSectionTitle(pathname: string) {
  for (const item of navItems) {
    if (item.href && pathname.startsWith(item.href)) return item.label;
    if (item.children) {
      for (const child of item.children) {
        if (pathname.startsWith(child.href)) return child.label;
      }
    }
  }
  return "";
}

export default function SidebarWithHeader({
  children,
}: {
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const sectionTitle = getSectionTitle(pathname);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #525252;
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #737373;
        }
        
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #525252 transparent;
        }
      `}</style>
      <aside className="w-64 min-w-64 max-w-64 bg-background border-r border-border shadow-sm flex flex-col flex-shrink-0">
        <div className="px-0 py-0 border-b border-border flex items-center justify-center bg-background">
          <Image
            src="/ristar.png"
            alt="RISTAR Logo" 
            width={220}
            height={100}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <nav className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          <ul className="space-y-1 px-3">
            {navItems.map((item) =>
              item.children ? (
                <Accordion 
                  key={item.label} 
                  type="single" 
                  collapsible
                  defaultValue={hasActiveChild(item, pathname) ? item.label : undefined}
                >
                  <AccordionItem value={item.label} className="border-0">
                    <AccordionTrigger
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md hover:bg-muted hover:text-orange-400 text-foreground cursor-pointer transition-colors duration-200 w-full",
                      hasActiveChild(item, pathname) &&
                        "bg-muted text-orange-400"
                    )}
                    >
                      <span className="flex items-center cursor-pointer">
                        {item.icon}
                      </span>
                      <span className="flex-1 flex items-center cursor-pointer">
                        {item.label}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-2 pt-1">
                      <ul className="space-y-1 pl-3">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                "flex items-center gap-2 pl-7 pr-4 py-2 rounded-md hover:bg-muted hover:text-orange-400 text-foreground cursor-pointer transition-colors duration-200 text-xs",
                                pathname === child.href &&
                                  "bg-orange-400/20 text-orange-400 hover:bg-orange-400/20 hover:text-orange-400"
                              )}
                            >
                              <span className="flex items-center cursor-pointer">
                                {child.icon}
                              </span>
                              <span className="flex-1 flex items-center cursor-pointer">
                                {child.label}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href!}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md hover:bg-muted hover:text-orange-400 text-foreground cursor-pointer transition-colors duration-200 w-full",
                      pathname === item.href && "bg-orange-400/20 text-orange-400 hover:bg-orange-400/20 hover:text-orange-400"
                    )}
                  >
                    <span className="flex items-center cursor-pointer">
                      {item.icon}
                    </span>
                    <span className="flex-1 flex items-center cursor-pointer">
                      {item.label}
                    </span>
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>
        <div className="p-3 text-xs text-muted-foreground text-center border-t border-border">
          &copy; {new Date().getFullYear()} Ristar Logistics.
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
        <header className="bg-background shadow px-6 py-4 flex items-center min-h-[64px] border-b border-border flex-shrink-0">
          {sectionTitle && (
            <span
              className="font-bold text-2xl text-orange-400 tracking-wide"
              style={{
                letterSpacing: "0.04em",
              }}
              title={sectionTitle}
            >
              {sectionTitle}
            </span>
          )}
        </header>
        <section className="flex-1 bg-background p-6 overflow-x-auto overflow-y-auto">
          {children}
        </section>
      </main>
    </div>
  );
}

