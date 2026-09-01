import { expect, test } from "@playwright/test";
import { login, mockRequests, resetMockApi } from "./support/fixtures";

test.describe("Produtos, estoque e vendas", () => {
  test.beforeEach(async ({ page, request }) => {
    await resetMockApi(request);
    await login(page);
  });

  test("cria um produto pelo formulário completo", async ({ page, request }) => {
    await page.goto("/dashboard/produtos?novo_produto=1");
    await expect(page.getByText("Adicionar produto", { exact: true }).first()).toBeVisible();
    const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Adicionar produto" }) });
    await form.getByLabel("Nome").fill("Shampoo automatizado");
    await form.getByLabel("Preço de custo").fill("2000");
    await form.getByLabel("Preço de venda").fill("4000");
    await form.getByLabel("Comissão (%)").fill("10");
    await form.getByLabel("Quantidade em estoque").fill("15");
    await form.getByLabel("Tipo de uso").selectOption("venda");
    await form.getByRole("combobox", { name: "Tipo", exact: true }).selectOption("produtos_capilares");
    await form.getByLabel("Estoque mínimo (alerta)").fill("3");
    await form.getByRole("button", { name: "Adicionar produto" }).click();

    await expect(page.getByText("Produto criado com sucesso.")).toBeVisible();
    const calls = await mockRequests(request);
    const creation = calls.find((call) => call.pathname === "/dashboard/products/" && call.method === "POST");
    expect(creation?.contentType).toContain("multipart/form-data");
    expect(creation?.body).toContain('name="name"');
    expect(creation?.body).toContain("Shampoo automatizado");
    expect(creation?.body).toContain('name="quantity"');
  });

  test("cria uma venda de produto", async ({ page, request }) => {
    await page.goto("/dashboard/produtos?nova_venda_produto=1");
    await expect(page.getByRole("paragraph").filter({ hasText: /^Adicionar venda$/ })).toBeVisible();
    await page.getByRole("button", { name: "Buscar produto" }).click();
    await page.getByRole("button", { name: /Pomada E2E/ }).click();
    await page.getByRole("button", { name: "Pix" }).click();
    await page.getByRole("button", { name: /Escolha o vendedor/ }).click();
    await page.getByRole("button", { name: "Profissional Teste" }).click();
    await page.getByLabel("Quantidade").fill("2");
    await page.getByRole("button", { name: "Adicionar venda" }).click();

    await expect(page.getByText("Venda registrada com sucesso.")).toBeVisible();
    const calls = await mockRequests(request);
    const creation = calls.find((call) => call.pathname === "/dashboard/transactions/" && call.method === "POST");
    expect(creation?.contentType).toContain("multipart/form-data");
    expect(creation?.body).toContain('name="product"');
    expect(creation?.body).toContain("40");
    expect(creation?.body).toContain('name="quantity"');
  });

  test("atualiza a quantidade em estoque", async ({ page, request }) => {
    await page.goto("/dashboard/produtos?produto=40");
    await expect(page.getByText("Informações do produto")).toBeVisible();
    await page.getByRole("button", { name: "Editar produto" }).click();
    await page.getByLabel("Quantidade", { exact: true }).fill("20");
    await page.getByRole("button", { name: "Salvar", exact: true }).click();
    await expect(page.getByText("Produto atualizado com sucesso.")).toBeVisible();

    const calls = await mockRequests(request);
    const update = calls.find((call) => call.pathname === "/dashboard/products/40/" && call.method === "PATCH");
    expect(update?.body).toContain('name="quantity"');
    expect(update?.body).toContain("20");
  });
});
