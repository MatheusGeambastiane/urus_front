import { env } from "@/lib/env";

export const goalsEndpoint = `${env.apiBaseUrl}/dashboard/goals/`;
export const goalsOverviewEndpoint = `${goalsEndpoint}overview/`;
export const homeGoalProgressEndpoint = `${goalsEndpoint}home-progress/`;
