export type GoalPeriodType = "monthly" | "annual";
export type GoalType = "institution_revenue" | "professional_revenue" | "professional_repass";

export type FinancialGoal = {
  id: number;
  goal_type: GoalType;
  period_type: GoalPeriodType;
  period_start: string;
  target_amount: string;
  show_on_home: boolean;
  professional_id: number | null;
};

export type GoalPace = {
  remaining: string;
  daily_required: string;
  weekly_required: string;
  monthly_required: string;
  operating_days_remaining: number;
};

export type RevenueProjection = {
  goal: FinancialGoal;
  actual: string;
  progress_percent: string;
  pace: GoalPace;
  required_by_source: { services: string; sales: string };
};

export type RepassProjection = {
  goal: FinancialGoal;
  actual_repass: string;
  remaining_repass: string;
  progress_percent: string;
  effective_repass_rate: string;
  estimated_total_revenue: string;
  additional_revenue_needed: string;
  pace: GoalPace;
  required_by_source: { services: string; sales: string };
  confidence: "low" | "high";
};

export type GoalActual = {
  services: string;
  sales: string;
  total_revenue: string;
};

export type HistoricalMix = {
  months: number;
  services_percent: string;
  sales_percent: string;
  confidence: "low" | "high";
};

export type ProfessionalGoalOverview = {
  professional: {
    id: number;
    user_id: number;
    name: string;
    commission: number;
    professional_type: string;
  };
  actual: GoalActual;
  historical_mix: HistoricalMix;
  revenue_goal: RevenueProjection | null;
  repass_goal: RepassProjection | null;
};

export type GoalsOverview = {
  viewer_role: "admin" | "professional";
  period: {
    type: GoalPeriodType;
    value: string;
    start_date: string;
    end_date: string;
    history_start_date: string;
    history_end_date: string;
  };
  institution: {
    actual: GoalActual;
    historical_mix: HistoricalMix;
    revenue_goal: RevenueProjection | null;
  } | null;
  professionals: ProfessionalGoalOverview[];
};

export type SaveGoalInput = {
  goal_type: GoalType;
  period_type: GoalPeriodType;
  period_start: string;
  target_amount: string;
  show_on_home?: boolean;
  professional?: number;
};

export type HomeGoalProgress = {
  goal_label: string;
  target_label: string;
  target_amount: string;
  progress_percent: string;
  today: { actual: string; required: string; on_track: boolean };
  week: {
    start_date: string;
    end_date: string;
    actual: string;
    required: string;
    on_track: boolean;
  };
};
