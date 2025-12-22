export type UserRole = 'studying' | 'working' | 'both';

export interface RoutineExpense {
  id: string;
  name: string;
  amount: number;
  category: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  role: UserRole;
  hasIncome: boolean;
  monthlyAllowance?: number;
  salary?: number;
  sideIncome?: number;
  spendingFrequency: 'rarely' | 'sometimes' | 'often' | 'always';
  plansBeforeSpending: boolean;
  topSpendingCategory: string;
  dailyLimit: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  routineExpenses: RoutineExpense[];
  createdAt: Date;
}

export interface OnboardingData {
  // Step 1: Basic Details
  name: string;
  age: number;
  role: UserRole;
  
  // Step 2: Income Details
  hasIncome: boolean;
  monthlyAllowance: number;
  salary: number;
  sideIncome: number;
  
  // Step 3: Spending Behaviour
  spendingFrequency: 'rarely' | 'sometimes' | 'often' | 'always';
  plansBeforeSpending: boolean;
  topSpendingCategory: string;
  
  // Step 4: Limits
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  
  // Step 5: Routine Expenses
  routineExpenses: RoutineExpense[];
}
