import { expect, test } from "@playwright/test";
import { login, mockRequests, resetMockApi } from "./support/fixtures";

test.describe("Intervalos", () => {
  test.beforeEach(async ({ page, request }) => {
    await resetMockApi(request);
    await login(page);
    await page.goto("/dashboard/intervalos/novo");
    await expect(page.getByRole("heading", { name: "Intervalos existentes" })).toBeVisible();
  });

  test("edita e exclui um intervalo existente", async ({ page, request }) => {
    await page.getByRole("button", { name: "Editar intervalo de Profissional Teste" }).click();
    await expect(page.getByRole("heading", { name: "Editar intervalo" })).toBeVisible();
    await page.getByLabel("Horário inicial da edição").fill("13:00");
    await page.getByLabel("Horário final da edição").fill("14:30");
    await page.getByRole("button", { name: "Salvar alterações" }).click();

    await expect(page.getByText("Intervalo atualizado com sucesso.")).toBeVisible();
    await expect(page.getByText("13:00", { exact: false })).toBeVisible();
    const editRequests = await mockRequests(request);
    expect(editRequests.find((call) => call.method === "PATCH" && call.pathname === "/dashboard/professional-intervals/81/")?.json).toMatchObject({
      hour_start: "13:00:00",
      hour_finish: "14:30:00",
    });

    await page.getByRole("button", { name: "Excluir intervalo de Profissional Teste" }).click();
    await expect(page.getByRole("heading", { name: "Excluir intervalo" })).toBeVisible();
    await page.getByRole("button", { name: "Excluir intervalo", exact: true }).click();

    await expect(page.getByText("Intervalo excluído com sucesso.")).toBeVisible();
    await expect(page.getByText("Nenhum intervalo nesta data")).toBeVisible();
    const deleteRequests = await mockRequests(request);
    expect(deleteRequests.some((call) => call.method === "DELETE" && call.pathname === "/dashboard/professional-intervals/81/")).toBe(true);
  });
});
