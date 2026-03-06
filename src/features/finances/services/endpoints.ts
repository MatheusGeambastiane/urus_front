import { env } from "@/lib/env";

export const financeSummaryEndpoint = `${env.apiBaseUrl}/dashboard/summary/`;
export const financeMonthlyReportEndpoint = `${env.apiBaseUrl}/dashboard/summary/monthly-report/`;
export const repassesEndpoint = `${env.apiBaseUrl}/dashboard/repasses/`;
export const repassesRecalculateEndpointBase = `${env.apiBaseUrl}/dashboard/repasses/recalculate/`;
export const billsEndpointBase = `${env.apiBaseUrl}/dashboard/bills/`;
export const professionalServiceSummaryEndpointBase = `${env.apiBaseUrl}/dashboard/professionals/`;
