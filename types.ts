
export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  DAILY_CHECKIN = 'DAILY_CHECKIN',
  WEEKLY_RESET = 'WEEKLY_RESET',
  MONTHLY_RECAP = 'MONTHLY_RECAP',
  USER_PROFILE = 'USER_PROFILE'
}

export interface BudgetAllocation {
  bills: number;
  income: number;
  savings: number;
  spendable: number;
  total: number;
}

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
}

export type CategoryClassification = 'movable' | 'bill' | 'debt';

export interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number; // This acts as the "target" or "requirement"
  spent: number;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  classification: CategoryClassification;
  dueDate?: string; // Day of month or specific date
  totalBalance?: number; // For debt categories
  payoffMonths?: number; // Historical target
  targetPayoffMonths?: number; // User-selected acceleration goal
  icon?: string;
}

export interface Goal {
  name: string;
  target: number;
  current: number;
}

export interface CategorySpend {
  category: string;
  amount: number;
}

export interface DailyRecord {
  date: string;
  spent: number;
  saved: number;
  checkInCompleted: boolean;
  breakdown?: CategorySpend[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export interface AppState {
  userName?: string;
  userEmail?: string;
  userImage?: string;
  theme: 'light' | 'dark';
  allocations: BudgetAllocation;
  incomeSources: IncomeSource[];
  categories: BudgetCategory[];
  goal: Goal;
  history: DailyRecord[];
  currentWeekCheckins: boolean[];
  badges: Badge[];
}

export interface AIReallocationResponse {
  newAllocations: BudgetAllocation;
  explanation: string;
}

export interface AIReviewResponse {
  strengths: string[];
  weaknesses: string[];
  advice: string;
}

export interface AIGoalSuggestion {
  suggestedName: string;
  suggestedAmount: number;
  reasoning: string;
}
