import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OnboardingData, RoutineExpense } from '@/types/user';

interface UserSettings {
  isOnboarded: boolean;
  name: string;
  email: string;
  age: number;
  role: 'studying' | 'working' | 'both';
  hasIncome: boolean;
  monthlyAllowance: number;
  salary: number;
  sideIncome: number;
  spendingFrequency: 'rarely' | 'sometimes' | 'often' | 'always';
  plansBeforeSpending: boolean;
  topSpendingCategory: string;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  routineExpenses: RoutineExpense[];
}

interface UserContextType {
  user: UserSettings | null;
  isOnboarded: boolean;
  completeOnboarding: (data: OnboardingData) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  logout: () => void;
  getTotalIncome: () => number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'pocketkash_user';

const defaultSettings: UserSettings = {
  isOnboarded: false,
  name: '',
  email: '',
  age: 18,
  role: 'studying',
  hasIncome: false,
  monthlyAllowance: 0,
  salary: 0,
  sideIncome: 0,
  spendingFrequency: 'sometimes',
  plansBeforeSpending: false,
  topSpendingCategory: 'food',
  dailyLimit: 0,
  weeklyLimit: 0,
  monthlyLimit: 0,
  routineExpenses: [],
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);

  const completeOnboarding = (data: OnboardingData) => {
    const newUser: UserSettings = {
      isOnboarded: true,
      name: data.name,
      email: '', // Will be set from auth if needed
      age: data.age,
      role: data.role,
      hasIncome: data.hasIncome,
      monthlyAllowance: data.monthlyAllowance,
      salary: data.salary,
      sideIncome: data.sideIncome,
      spendingFrequency: data.spendingFrequency,
      plansBeforeSpending: data.plansBeforeSpending,
      topSpendingCategory: data.topSpendingCategory,
      dailyLimit: data.dailyLimit,
      weeklyLimit: data.weeklyLimit,
      monthlyLimit: data.monthlyLimit,
      routineExpenses: data.routineExpenses,
    };
    setUser(newUser);
  };

  const updateSettings = (settings: Partial<UserSettings>) => {
    if (user) {
      setUser({ ...user, ...settings });
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const getTotalIncome = () => {
    if (!user) return 0;
    return user.monthlyAllowance + user.salary + user.sideIncome;
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      isOnboarded: user?.isOnboarded ?? false, 
      completeOnboarding, 
      updateSettings, 
      logout,
      getTotalIncome 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
