"use client";
import { NavItemChild } from "@/components/navs/types";
import { LayoutDashboardIcon, BracesIcon } from "lucide-react";

export const OverviewNavRoutes: NavItemChild[] = [
  {
    name: "Dashboard",
    href: "/overview/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    name: "Open API",
    href: "/overview/openapi",
    icon: BracesIcon,
  },
];
