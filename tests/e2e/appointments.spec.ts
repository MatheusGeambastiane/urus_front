import { expect, test } from "@playwright/test";
import {
  completeRequiredAppointmentFields,
  login,
  mockApiUrl,
  mockRequests,
  openAppointmentForm,
  resetMockApi,
  selectAppointmentPayment,
  selectAppointmentProfessional,
  selectAppointmentService,
} from "./support/fixtures";

test.describe("Agenda", () => {
  test.beforeEach(async ({ page, request }) => {
    await resetMockApi(request);
    await login(page);
  });

  test("mostra quando o profissional tem intervalo no dia", async ({ page }) => {
    await page.goto("/dashboard/agenda");

    const intervalSection = page.getByRole("heading", { name: "Intervalos dos profissionais" }).locator("xpath=../..");
    await expect(intervalSection.getByText("Profissional Teste", { exact: true })).toBeVisible();
    await expect(intervalSection.getByText("12:00–13:30", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Grade" }).click();
    await expect(page.getByText("Com intervalo", { exact: true })).toBeVisible();
    await expect(page.getByTitle("Intervalo das 12:00 às 13:30")).toBeVisible();
  });

  test("soma agendados e iniciados no total pendente", async ({ page, request }) => {
    await request.post(`${mockApiUrl}/__control`, { data: { includeInitiatedAppointment: true } });
    await page.goto("/dashboard/agenda");

    await page.getByRole("button", { name: "Mostrar valores" }).click();
    await page.getByRole("button", { name: "Ver detalhes" }).click();
    const pendingCard = page.getByText("Total pendente", { exact: true }).locator("..");
    await expect(pendingCard.getByText("R$ 80,00", { exact: true })).toBeVisible();
  });

  test("cria um agendamento e envia o contrato esperado", async ({ page, request }) => {
    await completeRequiredAppointmentFields(page);
    await expect(page.getByRole("radio", { name: "Sem desconto" })).toBeChecked();
    await page.getByRole("button", { name: "Salvar agendamento" }).click();
    await page.waitForURL(/\/dashboard\/agenda\/\d+$/);

    const calls = await mockRequests(request);
    const creation = calls.find((call) => call.method === "POST" && call.pathname === "/dashboard/appointments/");
    expect(creation?.json).toMatchObject({
      client: null,
      professional: 20,
      services: [30],
      payment_type: "pix",
      appointment_origin: "presencial",
      status: "agendado",
    });
  });

  test("aplica desconto percentual ao valor pago enquanto o usuário digita", async ({ page, request }) => {
    await completeRequiredAppointmentFields(page);

    await page.getByRole("radio", { name: "Porcentagem" }).click();
    const discountInput = page.getByLabel("Desconto (%)");
    await expect(discountInput).toBeEnabled();
    await discountInput.fill("10");
    await expect(page.getByText("R$ 45,00", { exact: true }).last()).toBeVisible();

    await page.getByRole("button", { name: "Salvar agendamento" }).click();
    await page.waitForURL(/\/dashboard\/agenda\/\d+$/);

    const calls = await mockRequests(request);
    const creation = calls.find((call) => call.method === "POST" && call.pathname === "/dashboard/appointments/");
    expect(creation?.json).toMatchObject({ discount: 10, price_paid: "45.00" });
  });

  test("aplica desconto financeiro e converte o percentual para o contrato da API", async ({ page, request }) => {
    await completeRequiredAppointmentFields(page);

    const discountInput = page.getByLabel("Desconto", { exact: true });
    await expect(discountInput).toBeDisabled();
    await page.getByRole("radio", { name: "Valor fixo" }).click();
    await page.getByLabel("Desconto (R$)").fill("12,50");
    await expect(page.getByText("R$ 37,50", { exact: true }).last()).toBeVisible();

    await page.getByRole("button", { name: "Salvar agendamento" }).click();
    await page.waitForURL(/\/dashboard\/agenda\/\d+$/);

    const calls = await mockRequests(request);
    const creation = calls.find((call) => call.method === "POST" && call.pathname === "/dashboard/appointments/");
    expect(creation?.json).toMatchObject({ discount: 25, price_paid: "37.50" });
  });

  test("detecta mesmo horário e permite confirmar a sobreposição", async ({ page, request }) => {
    await request.post(`${mockApiUrl}/__control`, { data: { conflictNextAppointment: true } });
    await completeRequiredAppointmentFields(page);
    await page.getByRole("button", { name: "Salvar agendamento" }).click();

    await expect(page.getByRole("heading", { name: "Confirmar horário ocupado" })).toBeVisible();
    await expect(page.getByText("Cliente Teste", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Confirmar mesmo assim" }).click();
    await page.waitForURL(/\/dashboard\/agenda\/\d+$/);

    const calls = await mockRequests(request);
    const creations = calls.filter((call) => call.method === "POST" && call.pathname === "/dashboard/appointments/");
    expect(creations).toHaveLength(2);
    expect(creations[1]?.json).toMatchObject({ confirm_overbooking: true });
  });

  test("cria cliente durante o agendamento e o associa", async ({ page, request }) => {
    await openAppointmentForm(page);
    const clientSection = page.locator("section").filter({ hasText: "Registrar cliente" });
    await clientSection.getByRole("button", { name: "Registrar cliente" }).click();
    const modal = page.getByRole("heading", { name: "Registrar cliente" }).locator("xpath=../../..");
    await modal.getByLabel("Nome", { exact: true }).fill("Maria");
    await modal.getByLabel("Sobrenome").fill("E2E");
    await modal.getByLabel("Email").fill("maria.e2e@teste.local");
    await modal.getByLabel("Telefone", { exact: true }).fill("71977776666");
    await modal.getByLabel("Data de nascimento", { exact: true }).fill("1995-06-10");
    await modal.getByRole("button", { name: "Salvar", exact: true }).click();
    await expect(clientSection.getByText("Maria E2E", { exact: true })).toBeVisible();

    await selectAppointmentService(page);
    await selectAppointmentProfessional(page);
    await selectAppointmentPayment(page, "Pix");
    await page.getByRole("button", { name: "Salvar agendamento" }).click();
    await page.waitForURL(/\/dashboard\/agenda\/\d+$/);

    const calls = await mockRequests(request);
    const clientCreation = calls.find((call) => call.pathname === "/dashboard/users/clients/" && call.method === "POST");
    expect(clientCreation?.json).toMatchObject({ first_name: "Maria", last_name: "E2E" });
    const appointmentCreation = calls.find((call) => call.pathname === "/dashboard/appointments/" && call.method === "POST");
    expect(appointmentCreation?.json?.client).toBe(200);
  });

  test("filtra provedores de e-mail e oferece contato genérico como switch", async ({ page }) => {
    await openAppointmentForm(page);
    const clientSection = page.locator("section").filter({ hasText: "Registrar cliente" });
    await clientSection.getByRole("button", { name: "Registrar cliente" }).click();
    const modal = page.getByRole("heading", { name: "Registrar cliente" }).locator("xpath=../../..");

    await expect(modal.getByRole("checkbox", { name: "Contato genérico" })).toBeVisible();
    const emailInput = modal.getByLabel("Email");
    await emailInput.fill("maria@g");
    await expect(modal.getByRole("button", { name: "maria@gmail.com" })).toBeVisible();
    await expect(modal.getByRole("button", { name: "maria@outlook.com" })).toHaveCount(0);
    await emailInput.fill("maria@provedor.local");
    await expect(modal.getByRole("button", { name: /maria@/ })).toHaveCount(0);
  });

  test("cria agendamentos com todas as formas de pagamento", async ({ page, request }) => {
    const cases = [
      ["Cartão de crédito", "credit"],
      ["Cartão de débito", "debit"],
      ["Pix", "pix"],
      ["Dinheiro", "dinheiro"],
    ] as const;

    for (const [label, apiValue] of cases) {
      await completeRequiredAppointmentFields(page, label);
      await page.getByRole("button", { name: "Salvar agendamento" }).click();
      await page.waitForURL(/\/dashboard\/agenda\/\d+$/);
      const calls = await mockRequests(request);
      const latest = calls.filter((call) => call.pathname === "/dashboard/appointments/" && call.method === "POST").at(-1);
      expect(latest?.json?.payment_type).toBe(apiValue);
    }
  });

  test("edita um agendamento existente", async ({ page, request }) => {
    await page.goto("/dashboard/agenda/77/editar");
    await expect(page.getByText("Editar agendamento", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Realizado" }).click();
    await page.getByLabel("Observações").fill("Alterado pelo teste automatizado");
    await page.getByRole("button", { name: "Salvar agendamento" }).click();
    await page.waitForURL("**/dashboard/agenda/77");

    const calls = await mockRequests(request);
    const update = calls.find((call) => call.pathname === "/dashboard/appointments/77/" && call.method === "PATCH");
    expect(update?.json).toMatchObject({ status: "realizado", observations: "Alterado pelo teste automatizado" });
  });

  test("inclui uma venda dentro do agendamento", async ({ page, request }) => {
    await completeRequiredAppointmentFields(page);
    const saleSection = page.locator("fieldset").filter({ hasText: "Venda" });
    await saleSection.getByRole("button", { name: "Adicionar venda" }).click();
    const modal = page.getByRole("heading", { name: "Adicionar produto" }).locator("xpath=../../..");
    await modal.getByRole("button", { name: /Pomada E2E/ }).click();
    await modal.getByLabel("Forma de pagamento").selectOption("pix");
    await modal.getByLabel("Quantidade").fill("2");
    await modal.getByRole("button", { name: "Adicionar produto" }).click();
    await expect(saleSection.getByText("Pomada E2E", { exact: true }).first()).toBeVisible();

    await page.getByRole("button", { name: "Salvar agendamento" }).click();
    await page.waitForURL(/\/dashboard\/agenda\/\d+$/);
    const calls = await mockRequests(request);
    const creation = calls.find((call) => call.pathname === "/dashboard/appointments/" && call.method === "POST");
    expect(creation?.json?.sells).toEqual([
      expect.objectContaining({ product: 40, quantity: 2, transaction_payment: "pix" }),
    ]);
  });
});
