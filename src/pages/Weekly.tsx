import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AddTransactionModal from '@/components/dashboard/AddTransactionModal';
import SmartAlerts, { SmartAlert } from '@/components/dashboard/SmartAlerts';
import { formatINR } from '@/lib/utils';
import { Transaction } from '@/types/finance';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Weekly = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { transactions, addTransaction } = useFinance();
  const { user } = useUser();
  const { toast } = useToast();

  const weeklyLimit = user?.weeklyLimit || 0;

  // Get last 7 days
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const weekTransactions = transactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate >= weekStart && transDate <= today && t.type === 'expense';
  });

  const spentThisWeek = weekTransactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = weeklyLimit > 0 ? Math.max(0, weeklyLimit - spentThisWeek) : 0;
  const progressPercent = weeklyLimit > 0 ? Math.min((spentThisWeek / weeklyLimit) * 100, 100) : 0;
  const isOverBudget = weeklyLimit > 0 && spentThisWeek > weeklyLimit;

  // Day-wise breakdown for chart
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyData = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const daySpending = transactions
      .filter(t => {
        const transDate = new Date(t.date);
        return transDate >= date && transDate <= dayEnd && t.type === 'expense';
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    dailyData.push({
      day: dayNames[date.getDay()],
      amount: daySpending,
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      isToday: i === 0,
    });
  }

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  weekTransactions.forEach(t => {
    if (t.category) {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    }
  });

  const categoryData = Object.entries(categoryBreakdown)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Generate alerts
  const generateAlerts = (): SmartAlert[] => {
    const alerts: SmartAlert[] = [];

    if (weeklyLimit > 0) {
      if (isOverBudget) {
        alerts.push({
          id: 'over-weekly',
          type: 'danger',
          title: 'Weekly limit exceeded!',
          message: `You've exceeded your weekly limit by ${formatINR(spentThisWeek - weeklyLimit)}.`,
        });
      } else if (progressPercent >= 80) {
        alerts.push({
          id: 'near-weekly',
          type: 'warning',
          title: 'Approaching weekly limit',
          message: `You've used ${Math.round(progressPercent)}% of your weekly budget.`,
        });
      }
    }

    // High spending day detection
    const avgDailySpend = spentThisWeek / 7;
    const highSpendDays = dailyData.filter(d => d.amount > avgDailySpend * 1.5);
    if (highSpendDays.length > 0) {
      alerts.push({
        id: 'high-spend-days',
        type: 'info',
        title: 'Spending pattern detected',
        message: `You spent more than average on ${highSpendDays.map(d => d.day).join(', ')}.`,
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

  const dailyAverage = spentThisWeek / 7;

  return (
    <AppLayout onAddExpense={() => setIsModalOpen(true)}>
      <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-primary" />
            Weekly Overview
          </h1>
          <p className="text-muted-foreground text-sm">
            {weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {today.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Weekly Summary */}
        <Card className={isOverBudget ? 'border-destructive/50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Weekly Budget</span>
              {weeklyLimit > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  Limit: {formatINR(weeklyLimit)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-destructive">{formatINR(spentThisWeek)}</div>
                <div className="text-xs text-muted-foreground">Total Spent</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
                  {weeklyLimit > 0 ? (isOverBudget ? `-${formatINR(spentThisWeek - weeklyLimit)}` : formatINR(remaining)) : '--'}
                </div>
                <div className="text-xs text-muted-foreground">{isOverBudget ? 'Over Budget' : 'Remaining'}</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{formatINR(Math.round(dailyAverage))}</div>
                <div className="text-xs text-muted-foreground">Daily Avg</div>
              </div>
            </div>
            
            {weeklyLimit > 0 && (
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
            )}
          </CardContent>
        </Card>

        {/* Smart Alerts */}
        {alerts.length > 0 && <SmartAlerts alerts={alerts} />}

        {/* Day-wise Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Daily Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    formatter={(value: number) => [formatINR(value), 'Spent']}
                    labelFormatter={(_, payload) => payload[0]?.payload.date}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {dailyData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isToday ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.3)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Category Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryData.map(({ category, amount }) => {
                  const percent = Math.round((amount / spentThisWeek) * 100);
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{category}</span>
                        <span className="font-medium">{formatINR(amount)} ({percent}%)</span>
                      </div>
                      <Progress value={percent} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AddTransactionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </AppLayout>
  );
};

export default Weekly;
