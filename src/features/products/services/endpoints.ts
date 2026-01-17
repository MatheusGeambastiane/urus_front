import { env } from "@/lib/env";

export const productsEndpointBase = `${env.apiBaseUrl}/dashboard/products/`;
export const transactionsEndpointBase = `${env.apiBaseUrl}/dashboard/transactions/`;
export const transactionsSellListEndpoint = `${env.apiBaseUrl}/dashboard/transactions/sell-list/`;
