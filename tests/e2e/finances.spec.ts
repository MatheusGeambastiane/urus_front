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
    await expect(page.getByText("42 atendimentos")).toBeVisible();

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

  test("abre os clientes recorrentes e novos com seus atendimentos", async ({ page, request }) => {
    await page.goto("/dashboard/financeiro");

    await page.getByRole("button", { name: /Clientes recorrentes/ }).click();
    const returningDialog = page.getByRole("dialog", { name: "Clientes recorrentes" });
    await expect(returningDialog.getByText("Bruno Recorrente")).toBeVisible();
    await expect(returningDialog.getByText("Corte · João Barbeiro")).toBeVisible();
    await expect(returningDialog.getByText("Barba · João Barbeiro")).toBeVisible();
    await returningDialog.getByRole("button", { name: "Fechar" }).click();

    await page.getByRole("button", { name: /Novos clientes/ }).click();
    const newDialog = page.getByRole("dialog", { name: "Novos clientes" });
    await expect(newDialog.getByText("Ana Nova")).toBeVisible();
    await expect(newDialog.getByText("ana@example.com")).toBeVisible();

    const calls = await mockRequests(request);
    expect(
      calls.some((call) => call.pathname === "/dashboard/summary/clients/returning/" && call.search.includes("month=")),
    ).toBe(true);
    expect(
      calls.some((call) => call.pathname === "/dashboard/summary/clients/new/" && call.search.includes("month=")),
    ).toBe(true);
  });

  test("exibe recorrências e permite excluir somente a conta aberta", async ({ page, request }) => {
    await page.goto("/dashboard/financeiro/contas/43");

    await expect(page.getByText("Conta recorrente", { exact: true })).toBeVisible();
    await expect(page.getByText("3 ocorrências vinculadas a esta série.")).toBeVisible();
    await expect(page.getByText("25/01/2027", { exact: true })).toBeVisible();
    await expect(page.getByText("25/03/2027", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Excluir conta" }).click();
    const dialog = page.getByRole("dialog", { name: "Excluir conta" });
    await expect(dialog.getByText("As demais contas desta recorrência não serão excluídas.", { exact: false })).toBeVisible();
    await dialog.getByRole("button", { name: "Excluir conta" }).click();

    await expect(page).toHaveURL(/\/dashboard\/financeiro$/);
    const calls = await mockRequests(request);
    expect(
      calls.some((call) => call.pathname === "/dashboard/bills/43/" && call.method === "DELETE"),
    ).toBe(true);
  });
});
