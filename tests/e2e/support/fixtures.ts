import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const mockApiUrl = "http://127.0.0.1:4100";

export async function resetMockApi(request: APIRequestContext) {
  await request.post(`${mockApiUrl}/__reset`);
}

export async function mockRequests(request: APIRequestContext) {
  const response = await request.get(`${mockApiUrl}/__requests`);
  return (await response.json()) as Array<{
    method: string;
    pathname: string;
    search: string;
    contentType: string;
    body: string;
    json: Record<string, unknown> | null;
  }>;
}

export async function login(page: Page) {
  await page.goto("/dashboard/login");
  await page.getByLabel("Email").fill("admin@teste.local");
  await page.locator('input[type="password"]').fill("SenhaE2E!123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL(/\/dashboard\/(home)?$/);
}

export async function openAppointmentForm(page: Page) {
  await page.goto("/dashboard/agenda/novo");
  await expect(page.getByText("Novo agendamento", { exact: true })).toBeVisible();
  await page.getByLabel("Data").fill("2026-09-20");
  await page.getByLabel("Hora").fill("14:30");
}

export async function selectAppointmentService(page: Page) {
  const servicesSection = page.locator("section").filter({ hasText: "Monte o combo ideal" });
  await servicesSection.getByRole("button", { name: "Selecionar" }).click();
  const modal = page.getByRole("heading", { name: "Escolha os serviços" }).locator("xpath=../../..");
  await modal.getByRole("checkbox", { name: /Corte E2E/ }).check();
  await modal.getByRole("button", { name: "Adicionar serviços" }).click();
  await expect(servicesSection.getByText("Corte E2E", { exact: true })).toBeVisible();
}

export async function selectAppointmentProfessional(page: Page) {
  const professionalsSection = page.locator("section").filter({ hasText: "Profissionais" }).first();
  await professionalsSection.getByRole("button", { name: /Selecionar.*Profissional 1/ }).click();
  const modal = page.getByRole("heading", { name: "Selecionar profissional" }).locator("xpath=../../..");
  await modal.getByRole("button", { name: "Profissional Teste" }).click();
  await expect(professionalsSection.getByText("Profissional Teste", { exact: true })).toBeVisible();
}

export async function selectAppointmentPayment(page: Page, paymentLabel: string) {
  const paymentSection = page.locator("section").filter({ hasText: "Defina valores e condição" });
  await paymentSection.getByRole("button", { name: /Forma de pagamento/ }).click();
  const modal = page.getByRole("heading", { name: "Escolha a forma" }).locator("xpath=../../..");
  await modal.getByRole("button", { name: paymentLabel }).click();
  await expect(paymentSection.getByText(paymentLabel, { exact: true })).toBeVisible();
}

export async function completeRequiredAppointmentFields(page: Page, paymentLabel = "Pix") {
  await openAppointmentForm(page);
  await selectAppointmentService(page);
  await selectAppointmentProfessional(page);
  await selectAppointmentPayment(page, paymentLabel);
}
