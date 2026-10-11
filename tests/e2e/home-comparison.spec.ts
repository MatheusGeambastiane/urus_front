import { expect, test } from "@playwright/test";
import { login, mockRequests, resetMockApi } from "./support/fixtures";

test.describe("Comparação média da Home", () => {
  test.beforeEach(async ({ page, request }) => {
    await resetMockApi(request);
    await login(page);
    await page.goto("/dashboard/home");
  });

  test("compara mês e permite escolher semanas para um range de segunda a sábado", async ({ page, request }) => {
    await page.getByRole("button", { name: "Filtros" }).click();
    let filterDialog = page.getByRole("dialog", { name: "Filtrar período" });
    await filterDialog.getByRole("button", { name: "Por mês" }).click();
    await filterDialog.getByLabel("Ano").selectOption("2026");
    await filterDialog.getByLabel("Mês").selectOption("10");
    await filterDialog.getByText("Comparar média", { exact: true }).click();
    await filterDialog.getByRole("button", { name: "Aplicar" }).click();

    await expect(page.getByText("Média dos 2 meses anteriores", { exact: true })).toBeVisible();
    const revenueChart = page.getByRole("group", { name: "Faturamento por data" });
    const comparedPeriodBar = revenueChart.getByRole("button").first();
    await comparedPeriodBar.hover();
    await expect(revenueChart.getByText("Agendamentos", { exact: true })).toBeVisible();
    await expect(revenueChart.getByText("Serviços", { exact: true })).toBeVisible();
    await expect(revenueChart.getByText("Vendas", { exact: true })).toBeVisible();
    await expect(revenueChart.getByText("10", { exact: true })).toBeVisible();
    await expect(revenueChart.getByText("12", { exact: true })).toBeVisible();
    await expect(revenueChart.getByText("R$ 100,00", { exact: true })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await revenueChart.getByRole("button").nth(1).click();
    await expect(revenueChart.getByText("14", { exact: true })).toBeVisible();
    await expect(revenueChart.getByText("R$ 150,00", { exact: true })).toBeVisible();

    let calls = await mockRequests(request);
    expect(
      calls.some((call) =>
        call.pathname === "/dashboard/summary/daily/" &&
        call.search.includes("month=2026-10") &&
        call.search.includes("compare=true")
      ),
    ).toBe(true);

    await page.getByRole("button", { name: "Filtros" }).click();
    filterDialog = page.getByRole("dialog", { name: "Filtrar período" });
    await filterDialog.getByRole("button", { name: "Por range" }).click();
    await filterDialog.locator("button:not([disabled])").filter({ hasText: /^5$/ }).first().click();
    await filterDialog.locator("button:not([disabled])").filter({ hasText: /^10$/ }).first().click();
    await filterDialog.getByRole("button", { name: "Aplicar" }).click();

    const modeDialog = page.getByRole("dialog", { name: "Como deseja comparar?" });
    await expect(modeDialog).toBeVisible();
    await expect(modeDialog.getByRole("button", { name: /Comparar os dias/ })).toBeVisible();
    await modeDialog.getByRole("button", { name: /Comparar 1ª semana/ }).click();

    await expect(page.getByText("1ª semana · média dos 2 meses anteriores", { exact: true })).toBeVisible();
    calls = await mockRequests(request);
    expect(
      calls.some((call) =>
        call.pathname === "/dashboard/summary/daily/" &&
        call.search.includes("start_date=2026-10-05") &&
        call.search.includes("end_date=2026-10-10") &&
        call.search.includes("compare=true") &&
        call.search.includes("comparison_mode=weeks")
      ),
    ).toBe(true);
  });
});
