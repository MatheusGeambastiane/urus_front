import { createServer } from "node:http";

const requestedPort = Number(
  process.argv.find((argument) => argument.startsWith("--port="))?.split("=")[1] ?? 4100,
);

const client = {
  id: 10,
  first_name: "Cliente",
  last_name: "Teste",
  email: "cliente@teste.local",
  phone: "71999990000",
  role: "client",
  role_display: "Cliente",
  is_active: true,
  is_unregistered_client: false,
  date_of_birth: "1990-01-15",
  cpf: "",
  profile_pic: null,
  professional_profile: null,
};

const professional = {
  id: 20,
  user_id: 2,
  user_name: "Profissional Teste",
  name: "Profissional Teste",
};

const service = { id: 30, name: "Corte E2E", price: "50.00", category: 1, category_name: "Cabelo" };
const product = {
  id: 40,
  name: "Pomada E2E",
  price_paid: "20.00",
  price_to_sell: "45.00",
  quantity: 12,
  use_type: "venda",
  type: "pomada",
  commission: 10,
  picture_of_product: null,
  alarm_quantity: 2,
  next_to_finish: false,
  created_at: "2026-09-01T10:00:00-03:00",
  updated_at: "2026-09-01T10:00:00-03:00",
};

const appointment = {
  id: 77,
  date_time: "2026-09-15T14:00:00-03:00",
  start_datetime: "2026-09-15T14:00:00-03:00",
  finish_datetime: "2026-09-15T15:00:00-03:00",
  client: client.id,
  client_name: "Cliente Teste",
  professional: professional.id,
  professional_name: professional.user_name,
  services: [{ id: service.id, name: service.name, category_name: service.category_name }],
  professional_services: [],
  sells: [],
  price_paid: "50.00",
  discount: 0,
  tips: "0.00",
  payment_type: "pix",
  status: "agendado",
  observations: "Agendamento usado nos testes E2E",
  appointment_origin: "presencial",
};

const userDetail = {
  ...client,
  id: 10,
  cpf: "12345678901",
};

let requests = [];
let conflictNextAppointment = false;
let nextAppointmentId = 100;
let nextClientId = 200;

function corsHeaders(request) {
  return {
    "Access-Control-Allow-Origin": request.headers.origin ?? "http://127.0.0.1:3100",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    Vary: "Origin",
  };
}

function send(request, response, status, payload, extraHeaders = {}) {
  const body = payload === undefined ? "" : JSON.stringify(payload);
  response.writeHead(status, {
    ...corsHeaders(request),
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders,
  });
  response.end(body);
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function bodyAsJson(body) {
  try {
    return JSON.parse(body || "{}");
  } catch {
    return null;
  }
}

function paginated(results) {
  return { count: results.length, next: null, previous: null, results };
}

const server = createServer(async (request, response) => {
  if (!request.url || !request.method) return send(request, response, 400, { detail: "Invalid request" });
  if (request.method === "OPTIONS") return send(request, response, 204, undefined);

  const url = new URL(request.url, `http://127.0.0.1:${requestedPort}`);
  const body = await readBody(request);
  const entry = {
    method: request.method,
    pathname: url.pathname,
    search: url.search,
    contentType: request.headers["content-type"] ?? "",
    body,
    json: bodyAsJson(body),
  };
  requests.push(entry);

  if (url.pathname === "/__health") return send(request, response, 200, { ok: true });
  if (url.pathname === "/__requests") return send(request, response, 200, requests);
  if (url.pathname === "/__reset" && request.method === "POST") {
    requests = [];
    conflictNextAppointment = false;
    return send(request, response, 200, { ok: true });
  }
  if (url.pathname === "/__control" && request.method === "POST") {
    conflictNextAppointment = Boolean(entry.json?.conflictNextAppointment);
    return send(request, response, 200, { ok: true });
  }

  if (url.pathname === "/dashboard/auth/login/" && request.method === "POST") {
    return send(request, response, 200, {
      access: "e2e-access-token",
      refresh: "e2e-refresh-token",
      user: {
        id: 1,
        first_name: "Admin",
        last_name: "E2E",
        email: "admin@teste.local",
        role: "admin",
        profile_pic: null,
      },
    });
  }
  if (url.pathname === "/dashboard/auth/refresh/" && request.method === "POST") {
    return send(request, response, 200, { access: "e2e-access-token", refresh: "e2e-refresh-token" });
  }

  if (url.pathname === "/dashboard/users/role-choices/") {
    return send(request, response, 200, [
      { value: "admin", label: "Administrador" },
      { value: "professional", label: "Profissional" },
      { value: "client", label: "Cliente" },
    ]);
  }
  if (url.pathname === "/dashboard/users/" && request.method === "GET") {
    return send(request, response, 200, paginated([client]));
  }
  if (url.pathname === "/dashboard/users/" && request.method === "POST") {
    return send(request, response, 201, { ...client, id: nextClientId++, ...(entry.json ?? {}) });
  }
  if (url.pathname === "/dashboard/users/clients/" && request.method === "POST") {
    const created = { ...client, id: nextClientId++, ...(entry.json ?? {}) };
    return send(request, response, 201, created);
  }
  if (url.pathname === "/dashboard/users/10/" && request.method === "GET") {
    return send(request, response, 200, userDetail);
  }
  if (url.pathname === "/dashboard/users/10/" && request.method === "PATCH") {
    return send(request, response, 200, { ...userDetail, first_name: "Cliente Editado", phone: "71988887777" });
  }
  if (url.pathname === "/dashboard/users/me/") return send(request, response, 200, userDetail);
  if (url.pathname.includes("/dashboard/appointments/summary/")) {
    return send(request, response, 200, {
      total_appointments: 1,
      total_paid_completed: "50.00",
      appointments_by_professional: [],
      appointments_by_service: [],
    });
  }

  if (url.pathname === "/dashboard/services/simple-list/") return send(request, response, 200, [service]);
  if (url.pathname === "/dashboard/professional-profiles/simple-list/") return send(request, response, 200, [professional]);

  if (url.pathname === "/dashboard/appointments/" && request.method === "GET") {
    return send(request, response, 200, {
      ...paginated([appointment]),
      completed_total_price: "0.00",
      completed_total_count: 0,
      day_restriction: null,
    });
  }
  if (url.pathname === "/dashboard/appointments/" && request.method === "POST") {
    if (conflictNextAppointment && !entry.json?.confirm_overbooking) {
      conflictNextAppointment = false;
      return send(request, response, 409, {
        code: "appointment_conflict",
        detail: "Já existe um agendamento neste horário.",
        conflicts: [appointment],
      });
    }
    return send(request, response, 201, { ...appointment, id: nextAppointmentId++ });
  }
  if (url.pathname === "/dashboard/appointments/77/" && request.method === "GET") {
    return send(request, response, 200, appointment);
  }
  if (url.pathname === "/dashboard/appointments/77/" && request.method === "PATCH") {
    return send(request, response, 200, { ...appointment, ...(entry.json ?? {}) });
  }
  if (/^\/dashboard\/appointments\/\d+\/$/.test(url.pathname) && request.method === "GET") {
    return send(request, response, 200, appointment);
  }
  if (url.pathname === "/dashboard/appointments/last-7-days/") {
    return send(request, response, 200, { last_7_days: [], top_day_in_month: null });
  }

  if (url.pathname === "/dashboard/products/" && request.method === "GET") {
    return send(request, response, 200, paginated([product]));
  }
  if (url.pathname === "/dashboard/products/" && request.method === "POST") {
    return send(request, response, 201, { ...product, id: 41, name: "Produto criado E2E" });
  }
  if (url.pathname === "/dashboard/products/40/" && request.method === "GET") return send(request, response, 200, product);
  if (url.pathname === "/dashboard/products/40/" && request.method === "PATCH") {
    return send(request, response, 200, { ...product, quantity: 20 });
  }
  if (url.pathname === "/dashboard/transactions/" && request.method === "POST") {
    return send(request, response, 201, { id: 501, type: "sell" });
  }
  if (url.pathname === "/dashboard/transactions/sell-list/") return send(request, response, 200, paginated([]));

  if (url.pathname === "/dashboard/summary/") {
    const month = url.searchParams.get("month") ?? "2026-09";
    const isJanuary = month.endsWith("-01");
    return send(request, response, 200, {
      month,
      revenue: isJanuary ? "4321.00" : "1234.50",
      expenses: "320.00",
      previous_month_period_revenue: "1000.00",
      revenue_difference_previous_month_period: isJanuary ? "3321.00" : "234.50",
      appointments_count: isJanuary ? 42 : 12,
      new_clients_count: 3,
      returning_clients_count: 9,
      sell_transactions_count: 4,
      appointments_average_per_day: "2.50",
      appointments_ticket_average: "65.00",
      appointments_sell_ticket_average: "82.00",
      appointments_by_payment_type: [
        { payment_type: "pix", total: 700 },
        { payment_type: "credit_card", total: 534.5 },
      ],
      appointments_by_day_hour: [{ date: `${month}-05`, hour: 10, count: 3 }],
      sell_by_payment_type: [{ transaction_payment: "pix", total: 180 }],
      payment_transactions_by_resource: [{ money_resource: "caixa", total: 320, count: 2 }],
    });
  }
  if (url.pathname === "/dashboard/summary/services/") {
    return send(request, response, 200, {
      month: url.searchParams.get("month") ?? "2026-09",
      period: { start: "2026-09-01", end: "2026-09-30" },
      services: [{ service_name: service.name, total: 8 }],
      professionals: [{ professional_id: 20, professional_name: professional.user_name, count: 8, percentage: "100" }],
    });
  }
  if (url.pathname === "/dashboard/repasses/ensure-month/") return send(request, response, 200, { ok: true });
  if (url.pathname === "/dashboard/repasses/") return send(request, response, 200, []);
  if (url.pathname === "/dashboard/bills/") return send(request, response, 200, []);
  if (url.pathname === "/dashboard/summary/daily/") {
    return send(request, response, 200, { revenue: "0", total_services_performed: 0, appointments_by_professional: [], top_services: [] });
  }

  return send(request, response, 200, {});
});

server.listen(requestedPort, "127.0.0.1", () => {
  process.stdout.write(`Mock API E2E listening on http://127.0.0.1:${requestedPort}\n`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
