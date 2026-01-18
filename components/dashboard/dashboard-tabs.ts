export type DashboardTab =
  | "home"
  | "agenda"
  | "services"
  | "products"
  | "users"
  | "finances"
  | "performance";

export const dashboardTabRoutes: Record<DashboardTab, string> = {
  home: "home",
  agenda: "agenda",
  services: "servicos",
  products: "produtos",
  users: "usuarios",
  finances: "financeiro",
  performance: "desempenho",
};

export const dashboardRouteToTab: Record<string, DashboardTab> = Object.entries(dashboardTabRoutes).reduce(
  (acc, [tab, route]) => {
    acc[route] = tab as DashboardTab;
    return acc;
  },
  {} as Record<string, DashboardTab>,
);

export const dashboardTabList: DashboardTab[] = [
  "home",
  "agenda",
  "services",
  "products",
  "users",
  "finances",
  "performance",
];

export const DEFAULT_DASHBOARD_TAB: DashboardTab = "home";
