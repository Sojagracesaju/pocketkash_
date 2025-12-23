import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import TransactionList from '@/components/dashboard/TransactionList';
import AddTransactionModal from '@/components/dashboard/AddTransactionModal';
import SmartAlerts, { SmartAlert } from '@/components/dashboard/SmartAlerts';
import { formatINR } from '@/lib/utils';
import { Transaction } from '@/types/finance';
import { useToast } from '@/hooks/use-toast';
import { Calendar, TrendingDown, Wallet, AlertTriangle } from 'lucide-react';

const Daily = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { transactions, addTransaction, deleteTransaction } = useFinance();
  const { user } = useUser();
  const { toast } = useToast();

  const dailyLimit = user?.dailyLimit || 0;

  // Get today's transactions
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTransactions = transactions.filter(t => {
    const transDate = new Date(t.date);
    transDate.setHours(0, 0, 0, 0);
    return transDate.getTime() === today.getTime() && t.type === 'expense';
  });

  const spentToday = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = Math.max(0, dailyLimit - spentToday);
  const progressPercent = dailyLimit > 0 ? Math.min((spentToday / dailyLimit) * 100, 100) : 0;
  const isOverBudget = spentToday > dailyLimit;

  // Category breakdown for today
  const categoryBreakdown: Record<string, number> = {};
  todayTransactions.forEach(t => {
    if (t.category) {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    }
  });

  // Calculate routine expenses remaining
  const routineExpenses = user?.routineExpenses || [];
  const currentHour = new Date().getHours();
  let routineExpensesRemaining = 0;
  
  if (currentHour < 12) {
    routineExpensesRemaining = routineExpenses.reduce((sum, e) => sum + e.amount, 0);
  } else if (currentHour < 18) {
    routineExpensesRemaining = routineExpenses.reduce((sum, e) => sum + e.amount, 0) * 0.5;
  }

  // Generate alerts
  const generateAlerts = (): SmartAlert[] => {
    const alerts: SmartAlert[] = [];

    if (isOverBudget) {
      alerts.push({
        id: 'over-budget',
        type: 'danger',
        title: 'Daily limit exceeded!',
        message: `You've exceeded your daily limit by ${formatINR(spentToday - dailyLimit)}. Try to balance tomorrow.`,
      });
    } else if (progressPercent >= 80) {
      alerts.push({
        id: 'near-limit',
        type: 'warning',
        title: 'Approaching daily limit',
        message: `You've used ${Math.round(progressPercent)}% of your daily budget. Only ${formatINR(remaining)} left.`,
      });
    }

    if (remaining < routineExpensesRemaining && remaining > 0 && !isOverBudget) {
      alerts.push({
        id: 'routine-warning',
        type: 'warning',
        title: 'Routine expenses ahead',
        message: `You usually spend around ${formatINR(routineExpensesRemaining)} more today. Spend carefully!`,
      });
    }

    // Impulse spending
    const impulseToday = todayTransactions.filter(t => t.emotionTag === 'impulse').length;
    if (impulseToday >= 2) {
      alerts.push({
        id: 'impulse-alert',
        type: 'warning',
        title: 'Multiple impulse purchases',
        message: 'You\'ve made several impulse purchases today. Take a moment before your next purchase.',
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    addTransaction(transaction);
    toast({
      title: 'Expense added!',
      description: `${formatINR(transaction.amount)} recorded successfully.`,
    });
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    toast({ title: 'Transaction deleted' });
  };

  return (
    <AppLayout onAddExpense={() => setIsModalOpen(true)}>
      <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-7 w-7 text-primary" />
            Daily Overview
          </h1>
          <p className="text-muted-foreground text-sm">
            {today.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Daily Budget Card */}
        <Card className={isOverBudget ? 'border-destructive/50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Today's Budget</span>
              <span className="text-sm font-normal text-muted-foreground">
                Limit: {formatINR(dailyLimit)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-destructive">{formatINR(spentToday)}</div>
                <div className="text-xs text-muted-foreground">Spent</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
                  {isOverBudget ? `-${formatINR(spentToday - dailyLimit)}` : formatINR(remaining)}
                </div>
                <div className="text-xs text-muted-foreground">{isOverBudget ? 'Over Budget' : 'Remaining'}</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{todayTransactions.length}</div>
                <div className="text-xs text-muted-foreground">Transactions</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Usage</span>
                <span className={progressPercent >= 80 ? 'text-destructive font-medium' : ''}>
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <Progress 
                value={progressPercent} 
                className={`h-3 ${isOverBudget ? '[&>div]:bg-destructive' : progressPercent >= 80 ? '[&>div]:bg-yellow-500' : ''}`} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Smart Alerts */}
        {alerts.length > 0 && <SmartAlerts alerts={alerts} />}

        {/* Category Breakdown */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(categoryBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="capitalize text-sm">{category}</span>
                      <span className="font-medium">{formatINR(amount)}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Transactions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Today's Expenses</h2>
          {todayTransactions.length > 0 ? (
            <TransactionList 
              transactions={todayTransactions} 
              onDelete={handleDeleteTransaction}
            />
          ) : (
            <Card className="text-center py-8">
              <CardContent>
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No expenses recorded today.</p>
                <p className="text-sm text-muted-foreground">Tap the button below to add your first expense.</p>
              </CardContent>
            </Card>
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

export default Daily;
