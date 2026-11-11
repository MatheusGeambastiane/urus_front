import { expect, test } from "@playwright/test";
import { login, mockRequests, resetMockApi } from "./support/fixtures";

test("atualiza a Home sem navegar, preserva filtros e mantém o horário em falhas", async ({ page, request }) => {
  await resetMockApi(request);
  await login(page);
  await page.goto("/dashboard/home");
  const button = page.getByRole("button", { name: "Atualizar", exact: true });
  await expect(button).toBeEnabled();
  await expect(page.getByRole("status")).toContainText(/Última atualização: \d{2}:\d{2}:\d{2}/);
  await page.getByRole("button", { name: "Filtros", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Filtrar período" });
  await dialog.getByRole("button", { name: "Por mês" }).click();
  await dialog.getByLabel("Ano").selectOption("2026");
  await dialog.getByLabel("Mês").selectOption("10");
  await dialog.getByRole("button", { name: "Aplicar", exact: true }).click();
  await expect(button).toBeEnabled();
  const before = (await mockRequests(request)).length;
  let navigated = false;
  page.on("framenavigated", (frame) => { if (frame === page.mainFrame()) navigated = true; });
  await button.click();
  await expect(button).toBeEnabled();
  const calls = (await mockRequests(request)).slice(before);
  for (const path of ["/dashboard/summary/daily/", "/dashboard/appointments/last-7-days/"]) {
    expect(calls.some((call) => call.pathname === path && call.search.includes("month=2026-10"))).toBe(true);
  }
  expect(calls.some((call) => call.pathname === "/dashboard/goals/home-progress/")).toBe(true);
  expect(navigated).toBe(false);
  const timestamp = await page.locator("header time").getAttribute("datetime");
  await page.route("**/dashboard/summary/daily/**", (route) => route.abort());
  await button.click();
  await expect(page.getByRole("alert").filter({ hasText: "Alguns dados não foram atualizados" })).toBeVisible();
  await expect(button).toBeEnabled();
  await expect(page.locator("header time")).toHaveAttribute("datetime", timestamp!);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(button).toBeVisible();
});
