import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DailyOverview from '@/components/dashboard/DailyOverview';
import SmartAlerts, { SmartAlert } from '@/components/dashboard/SmartAlerts';
import TransactionList from '@/components/dashboard/TransactionList';
import AddTransactionModal from '@/components/dashboard/AddTransactionModal';
import { useFinance } from '@/contexts/FinanceContext';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types/finance';
import { formatINR } from '@/lib/utils';

// Demo user settings - in production, this would come from user context
const userSettings = {
  dailyLimit: 200,
  routineExpenses: [
    { id: '1', name: 'Bus ticket', amount: 20, category: 'travel' },
    { id: '2', name: 'Tea', amount: 10, category: 'food' },
    { id: '3', name: 'Lunch', amount: 50, category: 'food' },
  ],
};

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { transactions, addTransaction, deleteTransaction } = useFinance();
  const { toast } = useToast();

  // Calculate today's spending
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTransactions = transactions.filter(t => {
    const transDate = new Date(t.date);
    transDate.setHours(0, 0, 0, 0);
    return transDate.getTime() === today.getTime() && t.type === 'expense';
  });

  const spentToday = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate routine expenses remaining (assume some are done based on time)
  const currentHour = new Date().getHours();
  let routineExpensesRemaining = 0;
  
  // Simplified logic: assume bus ticket is for evening, tea is morning, lunch is afternoon
  if (currentHour < 12) {
    routineExpensesRemaining = userSettings.routineExpenses.reduce((sum, e) => sum + e.amount, 0);
  } else if (currentHour < 18) {
    routineExpensesRemaining = 20; // Just bus ticket
  }

  // Generate smart alerts
  const generateAlerts = (): SmartAlert[] => {
    const alerts: SmartAlert[] = [];
    const remaining = userSettings.dailyLimit - spentToday;

    // Routine expense warning
    if (remaining < routineExpensesRemaining && remaining > 0) {
      alerts.push({
        id: 'routine-warning',
        type: 'warning',
        title: 'Watch your spending',
        message: `You usually spend ₹${routineExpensesRemaining} more today for routine expenses. Currently ₹${remaining} remaining.`,
      });
    }

    // Over budget
    if (remaining < 0) {
      alerts.push({
        id: 'over-budget',
        type: 'danger',
        title: 'Daily limit exceeded',
        message: `You've exceeded your daily limit by ${formatINR(Math.abs(remaining))}. Try to balance it tomorrow.`,
      });
    }

    // Impulse spending detection
    const impulseToday = todayTransactions.filter(t => t.emotionTag === 'impulse').length;
    if (impulseToday >= 2) {
      alerts.push({
        id: 'impulse-alert',
        type: 'warning',
        title: 'Multiple impulse purchases',
        message: 'You have made multiple impulse purchases today. Take a moment before your next purchase.',
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    addTransaction(transaction);
    toast({
      title: 'Transaction added!',
      description: `${transaction.type === 'income' ? 'Income' : 'Expense'} of ₹${transaction.amount} recorded.`,
    });
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    toast({
      title: 'Transaction deleted',
      description: 'The transaction has been removed.',
    });
  };

  return (
    <AppLayout onAddExpense={() => setIsModalOpen(true)}>
      <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Daily overview card */}
        <DailyOverview
          dailyLimit={userSettings.dailyLimit}
          spentToday={spentToday}
          routineExpensesRemaining={routineExpensesRemaining}
        />

        {/* Smart alerts */}
        {alerts.length > 0 && <SmartAlerts alerts={alerts} />}

        {/* Today's transactions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Today's Expenses</h2>
          {todayTransactions.length > 0 ? (
            <TransactionList 
              transactions={todayTransactions} 
              onDelete={handleDeleteTransaction}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl">
              <p>No expenses recorded today.</p>
              <p className="text-sm">Tap the button below to add your first expense.</p>
            </div>
          )}
        </div>
      </div>

      <AddTransactionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </AppLayout>
  );
};

export default Dashboard;
