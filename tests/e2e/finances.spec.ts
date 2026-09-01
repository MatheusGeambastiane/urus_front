import { expect, test } from "@playwright/test";
import { login, mockRequests, resetMockApi } from "./support/fixtures";

test.describe("Financeiro", () => {
  test.beforeEach(async ({ page, request }) => {
    await resetMockApi(request);
    await login(page);
  });

  test("aplica filtro mensal e atualiza indicadores e comparativos", async ({ page, request }) => {
    await page.goto("/dashboard/financeiro");
    await expect(page.getByText("Panorama do mês")).toBeVisible();
    await expect(page.getByText("vs mesmo período anterior")).toBeVisible();

    await page.getByRole("button", { name: "Selecionar mês" }).click();
    const modal = page.getByRole("heading", { name: "Selecionar mês" }).locator("xpath=../../..");
    await modal.getByLabel("Ano").selectOption("2026");
    await modal.getByLabel("Mês").selectOption("01");
    await modal.getByRole("button", { name: "Aplicar" }).click();

    await expect(page.getByText("janeiro de 2026", { exact: true })).toBeVisible();
    await expect(page.getByText("4.321,00", { exact: true })).toBeVisible();
    await expect(page.getByText("+R$ 3.321,00")).toBeVisible();
    await expect(page.getByText("42 serviços")).toBeVisible();

    const calls = await mockRequests(request);
    expect(
      calls.some((call) => call.pathname === "/dashboard/summary/" && call.search.includes("month=2026-01")),
    ).toBe(true);
    expect(
      calls.some((call) => call.pathname === "/dashboard/summary/services/" && call.search.includes("month=2026-01")),
    ).toBe(true);
    expect(
      calls.some((call) => call.pathname === "/dashboard/bills/" && call.search.includes("month=2026-01")),
    ).toBe(true);
  });
});
