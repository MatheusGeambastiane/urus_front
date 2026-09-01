import { expect, test } from "@playwright/test";
import { login, mockRequests, resetMockApi } from "./support/fixtures";

test.describe("Usuários", () => {
  test.beforeEach(async ({ page, request }) => {
    await resetMockApi(request);
    await login(page);
  });

  test("cria um usuário", async ({ page, request }) => {
    await page.goto("/dashboard/usuarios");
    await page.getByRole("button", { name: "Abrir opções" }).click();
    await page.getByRole("button", { name: "Novo usuário" }).click();
    await expect(page.getByText("Novo usuário", { exact: true })).toBeVisible();

    const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Criar usuário" }) });
    await form.getByLabel("Primeiro nome").fill("Novo");
    await form.getByLabel("Sobrenome").fill("Usuário E2E");
    await form.getByLabel("E-mail").fill("novo.usuario@teste.local");
    await form.getByLabel("Telefone").fill("71966665555");
    await form.getByLabel("Função").selectOption("admin");
    await form.getByPlaceholder("dd/mm/aaaa").fill("10/06/1990");
    await form.locator('input[type="password"]').nth(0).fill("SenhaE2E!123");
    await form.locator('input[type="password"]').nth(1).fill("SenhaE2E!123");
    await form.getByRole("button", { name: "Criar usuário" }).click();
    await expect(page.getByText("Usuário criado com sucesso.")).toBeVisible();

    const calls = await mockRequests(request);
    const creation = calls.find((call) => call.pathname === "/dashboard/users/" && call.method === "POST");
    expect(creation?.json).toMatchObject({
      first_name: "Novo",
      last_name: "Usuário E2E",
      email: "novo.usuario@teste.local",
      role: "admin",
      date_of_birth: "1990-06-10",
    });
  });

  test("altera as informações de um usuário", async ({ page, request }) => {
    await page.goto("/dashboard/usuarios/10");
    await expect(page.getByRole("heading", { name: "Perfil do usuário" })).toBeVisible();
    await page.getByRole("button", { name: "Editar", exact: true }).click();
    await page.getByLabel("Primeiro nome").fill("Cliente Editado");
    await page.getByLabel("Telefone").fill("71988887777");
    await page.getByRole("button", { name: "Salvar usuário" }).click();
    await expect(page.getByText("Usuário atualizado com sucesso.")).toBeVisible();

    const calls = await mockRequests(request);
    const update = calls.find((call) => call.pathname === "/dashboard/users/10/" && call.method === "PATCH");
    expect(update?.contentType).toContain("multipart/form-data");
    expect(update?.body).toContain("Cliente Editado");
    expect(update?.body).toContain("71988887777");
  });
});
