import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AddTransactionModal from '@/components/dashboard/AddTransactionModal';
import SmartAlerts, { SmartAlert } from '@/components/dashboard/SmartAlerts';
import { formatINR } from '@/lib/utils';
import { Transaction } from '@/types/finance';
import { useToast } from '@/hooks/use-toast';
import { CalendarRange, TrendingUp, AlertTriangle, Lightbulb, PieChart } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const Monthly = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { transactions, addTransaction } = useFinance();
  const { user } = useUser();
  const { toast } = useToast();

  const monthlyLimit = user?.monthlyLimit || 0;

  // Get current month data
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
  const daysInMonth = monthEnd.getDate();
  const currentDay = today.getDate();

  const monthTransactions = transactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate >= monthStart && transDate <= monthEnd && t.type === 'expense';
  });

  const spentThisMonth = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const remaining = monthlyLimit > 0 ? Math.max(0, monthlyLimit - spentThisMonth) : 0;
  const progressPercent = monthlyLimit > 0 ? Math.min((spentThisMonth / monthlyLimit) * 100, 100) : 0;
  const isOverBudget = monthlyLimit > 0 && spentThisMonth > monthlyLimit;

  // Expected spending pace
  const expectedSpendingPace = monthlyLimit > 0 ? (monthlyLimit / daysInMonth) * currentDay : 0;
  const isAheadOfPace = spentThisMonth > expectedSpendingPace * 1.1;
  const dailyRemaining = remaining / Math.max(1, daysInMonth - currentDay + 1);

  // Category breakdown for pie chart
  const categoryBreakdown: Record<string, number> = {};
  monthTransactions.forEach(t => {
    if (t.category) {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    }
  });

  const pieData = Object.entries(categoryBreakdown)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Money leak detection
  const detectMoneyLeaks = () => {
    const leaks: { category: string; amount: number; percent: number; message: string }[] = [];
    
    Object.entries(categoryBreakdown).forEach(([category, amount]) => {
      const percent = Math.round((amount / spentThisMonth) * 100);
      
      if (category === 'food' && percent > 40) {
        leaks.push({
          category,
          amount,
          percent,
          message: `Food expenses are ${percent}% of your spending. Consider cooking more at home.`,
        });
      }
      if (category === 'entertainment' && percent > 25) {
        leaks.push({
          category,
          amount,
          percent,
          message: `Entertainment is ${percent}% of spending. Look for free alternatives.`,
        });
      }
      if (category === 'shopping' && percent > 30) {
        leaks.push({
          category,
          amount,
          percent,
          message: `Shopping takes ${percent}% of your budget. Apply the 24-hour rule before buying.`,
        });
      }
    });

    return leaks;
  };

  const moneyLeaks = detectMoneyLeaks();

  // Emotion-based analysis
  const emotionBreakdown: Record<string, number> = {};
  monthTransactions.forEach(t => {
    if (t.emotionTag) {
      emotionBreakdown[t.emotionTag] = (emotionBreakdown[t.emotionTag] || 0) + t.amount;
    }
  });

  const impulseSpending = emotionBreakdown['impulse'] || 0;
  const stressSpending = emotionBreakdown['stress'] || 0;

  // Generate alerts
  const generateAlerts = (): SmartAlert[] => {
    const alerts: SmartAlert[] = [];

    if (isOverBudget) {
      alerts.push({
        id: 'over-monthly',
        type: 'danger',
        title: 'Monthly limit exceeded!',
        message: `You've exceeded your monthly limit by ${formatINR(spentThisMonth - monthlyLimit)}.`,
      });
    } else if (progressPercent >= 80) {
      alerts.push({
        id: 'near-monthly',
        type: 'warning',
        title: 'Approaching monthly limit',
        message: `You've used ${Math.round(progressPercent)}% of your monthly budget with ${daysInMonth - currentDay} days left.`,
      });
    }

    if (isAheadOfPace && !isOverBudget && monthlyLimit > 0) {
      alerts.push({
        id: 'pace-warning',
        type: 'warning',
        title: 'Spending faster than expected',
        message: `You're spending faster than your daily pace. Limit to ${formatINR(Math.round(dailyRemaining))}/day to stay on track.`,
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

  const monthName = today.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <AppLayout onAddExpense={() => setIsModalOpen(true)}>
      <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <CalendarRange className="h-7 w-7 text-primary" />
            Monthly Overview
          </h1>
          <p className="text-muted-foreground text-sm">{monthName}</p>
        </div>

        {/* Monthly Summary */}
        <Card className={isOverBudget ? 'border-destructive/50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Monthly Budget</span>
              {monthlyLimit > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  Limit: {formatINR(monthlyLimit)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-destructive">{formatINR(spentThisMonth)}</div>
                <div className="text-xs text-muted-foreground">Total Spent</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
                  {monthlyLimit > 0 ? (isOverBudget ? `-${formatINR(spentThisMonth - monthlyLimit)}` : formatINR(remaining)) : '--'}
                </div>
                <div className="text-xs text-muted-foreground">{isOverBudget ? 'Over Budget' : 'Remaining'}</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{monthTransactions.length}</div>
                <div className="text-xs text-muted-foreground">Transactions</div>
              </div>
            </div>
            
            {monthlyLimit > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget Usage ({currentDay}/{daysInMonth} days)</span>
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

            {monthlyLimit > 0 && !isOverBudget && (
              <p className="text-sm text-muted-foreground text-center bg-muted/50 rounded-lg py-2">
                💡 You can spend up to <span className="font-semibold text-foreground">{formatINR(Math.round(dailyRemaining))}</span> per day for the rest of the month.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Smart Alerts */}
        {alerts.length > 0 && <SmartAlerts alerts={alerts} />}

        {/* Category Pie Chart */}
        {pieData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatINR(value)} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Money Leaks */}
        {moneyLeaks.length > 0 && (
          <Card className="border-yellow-500/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Money Leaks Detected
              </CardTitle>
              <CardDescription>Areas where you might be overspending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {moneyLeaks.map((leak, index) => (
                <div key={index} className="bg-yellow-500/10 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium capitalize">{leak.category}</span>
                    <span className="text-destructive font-semibold">{formatINR(leak.amount)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{leak.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Emotion Spending Analysis */}
        {(impulseSpending > 0 || stressSpending > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Emotional Spending
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {impulseSpending > 0 && (
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Impulse Purchases</p>
                    <p className="text-xs text-muted-foreground">Unplanned spending</p>
                  </div>
                  <span className="text-lg font-bold text-destructive">{formatINR(impulseSpending)}</span>
                </div>
              )}
              {stressSpending > 0 && (
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Stress Spending</p>
                    <p className="text-xs text-muted-foreground">Emotional purchases</p>
                  </div>
                  <span className="text-lg font-bold text-destructive">{formatINR(stressSpending)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reflection */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-6 text-center">
            <p className="text-lg font-medium mb-2">Monthly Reflection</p>
            <p className="text-muted-foreground">
              "Was all your spending this month truly necessary? What could you have saved?"
            </p>
          </CardContent>
        </Card>
      </div>

      <AddTransactionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </AppLayout>
  );
};

export default Monthly;
