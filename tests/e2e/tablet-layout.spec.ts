import { expect, test } from "@playwright/test";
import { login, resetMockApi } from "./support/fixtures";

test("adapta o painel para tablets e mantém a navegação inferior", async ({ page, request }, testInfo) => {
  test.setTimeout(120_000);
  await page.route("**/dashboard/service-categories/simple-list/", route => route.fulfill({ json: [{ id: 1, name: "Cabelo" }] }));
  await page.route("**/dashboard/assistant/chats/**", route => route.fulfill({ json: { results: [], next: null } }));
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/dashboard/services/?*", route => route.fulfill({ json: { results: [{ id: 30, name: "Corte E2E", price: "50.00", duration: "00:30:00", service_photo: null, is_active: true, category: 1, category_name: "Cabelo" }], count: 1, next: null, previous: null } }));
  await resetMockApi(request);
  await login(page);
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 820, height: 1180 },
    { width: 1024, height: 768 },
    { width: 1180, height: 820 },
    { width: 1366, height: 1024 },
  ]) {
    await page.setViewportSize(viewport);
    await expect(page.locator("aside")).toBeHidden();
    const nav = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(nav).toBeVisible();
    const main = await page.locator("main").boundingBox();
    expect(main!.width).toBeGreaterThanOrEqual(Math.min(viewport.width, 1200));
    for (const route of ["home", "agenda", "servicos", "produtos", "usuarios", "financeiro", "chat"]) {
      await page.goto(`/dashboard/${route}`);
      await expect(nav).toBeVisible();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), { message: `${route} em ${viewport.width}px não deve ter rolagem horizontal` }).toBe(true);
      if (route === "home" && viewport.width === 820) {
        await page.screenshot({ path: testInfo.outputPath("tablet-home.png"), fullPage: true });
      }
      if (route === "chat") {
        const composer = page.locator("textarea");
        await expect(composer).toBeVisible();
        const box = await composer.boundingBox();
        const navBox = await nav.boundingBox();
        expect(box!.y + box!.height).toBeLessThan(navBox!.y);
      }
    }
    await nav.getByRole("button", { name: "Agenda", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/agenda$/);
  }
  expect(errors).toEqual([]);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("aside")).toBeVisible();
  await expect(page.locator("nav").last()).toBeHidden();
});
