export type ExpenseCategory = 'food' | 'travel' | 'shopping' | 'entertainment' | 'others';
export type EmotionTag = 'need' | 'impulse' | 'stress' | 'celebration';
export type IncomeSource = 'allowance' | 'salary' | 'side-income' | 'others';
export type BehaviourType = 'planned' | 'impulsive' | 'frequent-small';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category?: ExpenseCategory;
  source?: IncomeSource;
  emotionTag?: EmotionTag;
  date: Date;
  description?: string;
}

export interface Insight {
  id: string;
  type: 'behaviour' | 'leak' | 'saving' | 'alert';
  title: string;
  description: string;
  icon: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
  behaviourType: BehaviourType;
}
