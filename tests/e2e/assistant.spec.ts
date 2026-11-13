import { expect, test, type Page } from "@playwright/test";
import { login, resetMockApi } from "./support/fixtures";

async function mockAssistant(page: Page, textOnly = false) {
  const chat = { id: "chat-1", title: "Nova conversa", archived: false, processing_until: null };
  const messages: Record<string, unknown>[] = [];
  let proposals: Record<string, unknown>[] = [];
  let writes = 0;
  let created = false;
  const summary = { operation: "Alterar agendamento", overbooking: true, fields: [{ label: "Cliente", value: "Matheus Silva" }, { label: "Serviços", value: "Corte" }, { label: "Data e hora", value: "2026-11-13T19:00:00-03:00" }, { label: "Valor", value: "120.00" }] };
  await page.route("**/dashboard/assistant/chats/**", async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    let body: unknown;
    if (path.endsWith("/chats/")) {
      if (request.method() === "POST") { created = true; body = chat; }
      else body = { results: created ? [chat] : [], next: null };
    } else if (path.endsWith("/messages/")) {
      if (request.method() === "POST") {
        const payload = request.postDataJSON();
        messages.push({ id: messages.length + 1, role: "user", content: payload.content, blocks: [], status: "completed" });
        const blocks = payload.selected_client_id ? [{ type: "proposal", action_id: "a1", summary }] : [{ type: "clients", query: "mateus", options: [{ id: 7, name: "Matheus Silva", phone_hint: "•••• 1234" }] }];
        if (payload.selected_client_id && !textOnly) proposals = [{ id: "a1", state: "pending", summary }];
        const answer = { id: messages.length + 1, role: "assistant", content: payload.selected_client_id ? `Proposta preparada — nada foi gravado ainda.

- **Cliente:** Matheus Silva
- **Alteração:** horário para 13/11/2026, 19:00–20:30

⚠️ **Encaixe:** revise a sobreposição.

Dados estruturados do sistema: ${JSON.stringify(blocks)}` : "Entendi: corte amanhã às 10h para você. Selecione o cliente.", blocks, status: "completed" };
        if (textOnly && payload.selected_client_id) answer.blocks = [];
        messages.push(answer); body = answer;
      } else body = { results: [...messages].reverse(), next: null };
    } else if (path.endsWith("/confirm/")) {
      writes++; proposals[0].state = "completed";
      messages.push({ id: messages.length + 1, role: "assistant", content: "Operação concluída. Registro #42.", blocks: [{ type: "result", entity: "appointment", id: 42 }], status: "completed" });
      body = proposals[0];
    } else if (path.endsWith("/cancel/")) {
      proposals[0].state = "cancelled"; body = proposals[0];
    } else if (path.endsWith("/actions/")) body = proposals;
    else if (request.method() === "PATCH") { Object.assign(chat, request.postDataJSON()); body = chat; }
    else body = chat;
    await route.fulfill({ json: body });
  });
  return { writes: () => writes };
}

test.describe("Assistente", () => {
  test.beforeEach(async ({ page, request }) => { await resetMockApi(request); await login(page); });

  test("seleciona cliente, restaura proposta e só grava após confirmação", async ({ page }, testInfo) => {
    const mock = await mockAssistant(page);
    await page.goto("/dashboard/chat");
    await page.getByLabel("Mensagem", { exact: true }).fill("Agende mateus para corte amanhã às 10h para mim, pix");
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await expect(page.getByText("Entendi: corte amanhã às 10h para você. Selecione o cliente.")).toBeVisible();
    await page.getByRole("radio", { name: /Matheus Silva/ }).check();
    await page.getByRole("button", { name: "Enviar respostas" }).click();
    await expect(page.getByRole("button", { name: "Confirmar", exact: true })).toBeVisible();
    const card = page.getByRole("region", { name: "Resumo da proposta" });
    await expect(card).toContainText("13/11/2026, 19:00");
    await expect(card).toContainText(/R\$\s120,00/);
    await expect(card).toContainText("Encaixe solicitado");
    await expect(page.getByText(/Dados estruturados do sistema/)).toHaveCount(0);
    const confirmPanel = page.getByRole("region", { name: "Confirmar proposta pendente" });
    const panelBox = await confirmPanel.boundingBox();
    const inputBox = await page.getByLabel("Mensagem", { exact: true }).boundingBox();
    expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(inputBox!.y);
    expect(mock.writes()).toBe(0);
    await page.getByRole("button", { name: "Confirmar", exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath("assistant-chat.png"), fullPage: true });
    await page.reload();
    await page.getByRole("button", { name: "Nova conversa", exact: true }).last().click();
    await expect(page.getByRole("button", { name: "Confirmar", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Confirmar", exact: true }).click();
    await expect(page.getByText("Operação concluída. Registro #42.")).toBeVisible();
    expect(mock.writes()).toBe(1);
    await expect(page.getByRole("button", { name: "Confirmar", exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Ver agenda/ })).toHaveAttribute("href", "/dashboard/agenda/42");
  });

  test("oferece resposta pronta quando a proposta chega apenas no texto", async ({ page }) => {
    const mock = await mockAssistant(page, true);
    await page.goto("/dashboard/chat");
    await page.getByLabel("Mensagem", { exact: true }).fill("Agende um corte");
    await page.getByRole("button", { name: "Enviar mensagem" }).click();
    await page.getByRole("radio", { name: /Matheus Silva/ }).check();
    await page.getByRole("button", { name: "Enviar respostas" }).click();
    await expect(page.getByText("Responder à proposta")).toBeVisible();
    await page.getByRole("button", { name: "Confirmar", exact: true }).click();
    await expect(page.getByText("Confirmo a proposta apresentada.", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Confirmar", exact: true })).toHaveCount(0);
    expect(mock.writes()).toBe(0);
  });

  test("mostra erro legível quando o servidor retorna HTML", async ({ page }) => {
    await page.route("**/dashboard/assistant/chats/", route => route.fulfill({
      status: 502, contentType: "text/html", body: "<!doctype html><html>Bad Gateway</html>",
    }));
    await page.goto("/dashboard/chat");
    await expect(page.getByRole("alert", { name: "Erro do chat" })).toContainText("HTTP 502");
    await expect(page.getByRole("alert", { name: "Erro do chat" })).toContainText("indisponível ou demorou");
    await expect(page.getByRole("alert", { name: "Erro do chat" })).not.toContainText("Unexpected token");
    await expect(page.getByRole("alert", { name: "Erro do chat" })).not.toContainText("<!doctype");
  });

  test("dita no campo sem enviar e permite edição", async ({ page }) => {
    await page.addInitScript(() => {
      class MockRecognition {
        onresult: ((event: unknown) => void) | null = null;
        onend: (() => void) | null = null;
        start() { this.onresult?.({ resultIndex: 0, results: [{ isFinal: false, 0: { transcript: "Agende Matheus amanhã" } }] }); }
        stop() { this.onend?.(); }
        abort() {}
      }
      Object.assign(window, { SpeechRecognition: MockRecognition });
    });
    const mock = await mockAssistant(page);
    await page.goto("/dashboard/chat");
    for (const path of ["/", "/login", "/dashboard", "/dashboard/chat"]) {
      const policy = await page.request.get(path);
      expect(policy.headers()["permissions-policy"]).toContain("microphone=(self)");
    }
    expect(await page.evaluate(() => {
      const policy = (document as Document & {
        featurePolicy?: { allowsFeature: (name: string) => boolean };
      }).featurePolicy;
      return policy?.allowsFeature("microphone");
    })).toBe(true);
    await page.getByRole("button", { name: "Ditar mensagem" }).click();
    await expect(page.getByLabel("Mensagem", { exact: true })).toHaveValue("Agende Matheus amanhã");
    await page.getByRole("button", { name: "Parar ditado" }).click();
    await page.getByLabel("Mensagem", { exact: true }).fill("Agende Matheus amanhã às 10h");
    expect(mock.writes()).toBe(0);
    await expect(page.getByText("Você", { exact: true })).toHaveCount(0);
  });
  test("mantém o compositor acima da navegação no celular", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockAssistant(page);
    await page.goto("/dashboard/chat");
    await expect(page.getByLabel("Mensagem", { exact: true })).toBeVisible();
    const send = await page.getByRole("button", { name: "Enviar mensagem" }).boundingBox();
    const navigation = await page.getByRole("navigation", { name: "Navegação principal" }).boundingBox();
    expect(send!.y + send!.height).toBeLessThan(navigation!.y);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.getByRole("button", { name: "Abrir histórico" }).click();
    await expect(page.getByRole("button", { name: "Nova conversa", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Fechar histórico" }).click();
    await expect(page.getByLabel("Mensagem", { exact: true })).toBeVisible();
  });

});


test("perguntas em etapas e envio otimista com indicador de resposta", async ({ page, request }) => {
  await resetMockApi(request);
  await login(page);
  const chat = { id: "steps", title: "Agendamento", archived: false, processing_until: null };
  const messages: Record<string, unknown>[] = [];
  const submissions: string[] = [];
  let release: (() => void) | undefined;
  await page.route("**/dashboard/assistant/chats/**", async route => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = chat;
    if (path.endsWith('/chats/')) body = route.request().method() === 'POST' ? chat : {results:[chat], next:null};
    if (path.endsWith('/actions/')) body = [];
    if (path.endsWith('/messages/')) {
      if (route.request().method() === 'POST') {
        const {content} = route.request().postDataJSON();
        submissions.push(content);
        await new Promise<void>(resolve => { release = resolve; });
        messages.push({id:messages.length+1, role:'user',content,blocks:[],status:'completed'});
        const answer = {id:messages.length+1, role:'assistant', content:'Vamos completar os detalhes.',status:'completed',blocks: submissions.length === 1 ? [{type:'questions',questions:[
          {id:'service',title:'Qual serviço?',options:[{label:'Corte',value:'corte'},{label:'Barba',value:'barba'}]},
          {id:'payment',title:'Como deseja pagar?',options:[{label:'Pix',value:'pix'},{label:'Dinheiro',value:'dinheiro'}]},
        ]}] : []};
        messages.push(answer); body = answer;
      } else body={results:[...messages].reverse(),next:null};
    }
    await route.fulfill({json:body});
  });
  await page.goto('/dashboard/chat');
  await page.getByLabel('Mensagem', {exact:true}).fill('Quero agendar');
  await page.getByRole('button',{name:'Enviar mensagem',exact:true}).click();
  await expect(page.getByText('Quero agendar',{exact:true})).toBeVisible();
  await expect(page.getByRole('status',{name:'Urus está preparando a resposta'})).toBeVisible();
  await expect(page.getByLabel('Mensagem',{exact:true})).toHaveValue('');
  await expect.poll(()=>Boolean(release)).toBe(true);
  release!(); release=undefined;
  await expect(page.getByText('Pergunta 1 de 2')).toBeVisible();
  await expect(page.getByRole('radio',{name:'Pix',exact:false})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Próxima',exact:true})).toBeDisabled();
  await page.getByRole('radio',{name:/Corte/}).check();
  await page.getByRole('button',{name:'Próxima',exact:true}).click();
  await expect(page.getByText('Pergunta 2 de 2')).toBeVisible();
  await page.getByRole('button',{name:'Voltar',exact:true}).click();
  await expect(page.getByRole('radio',{name:/Corte/})).toBeChecked();
  await page.getByRole('button',{name:'Próxima',exact:true}).click();
  await page.getByRole('radio',{name:'Outra resposta',exact:true}).check();
  await page.getByLabel('Resposta: Como deseja pagar?').fill('Cartão de débito');
  expect(submissions.length).toBe(1);
  await page.getByRole('button',{name:'Enviar respostas',exact:true}).click();
  await expect.poll(()=>submissions.length).toBe(2);
  expect(submissions[1]).toContain('Qual serviço?: Corte');
  expect(submissions[1]).toContain('Cartão de débito');
  release!();
  await expect(page.getByRole('status',{name:'Urus está preparando a resposta'})).toHaveCount(0);
});
