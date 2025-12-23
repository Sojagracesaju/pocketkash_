import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatINR } from '@/lib/utils';
import { Lightbulb, Target, TrendingUp, Brain, Zap, Heart, AlertTriangle, Sparkles } from 'lucide-react';

const Insights = () => {
  const { transactions, getSummary, getInsights } = useFinance();
  const { user } = useUser();

  const summary = getSummary();
  const insights = getInsights();

  // Behaviour analysis
  const behaviourDescriptions = {
    planned: {
      title: 'Planned Spender',
      description: 'You think before you spend. Most of your purchases are intentional and well-considered.',
      icon: Target,
      color: 'text-green-600',
      tip: 'Keep up the great work! Consider setting even higher savings goals.',
    },
    impulsive: {
      title: 'Impulsive Spender',
      description: 'You tend to make quick purchasing decisions without much planning.',
      icon: Zap,
      color: 'text-orange-500',
      tip: 'Try the 24-hour rule: wait a day before making non-essential purchases.',
    },
    'frequent-small': {
      title: 'Frequent Small Spender',
      description: 'You make many small purchases that add up over time.',
      icon: TrendingUp,
      color: 'text-blue-500',
      tip: 'Track those small daily expenses - they might be your biggest money leak!',
    },
  };

  const behaviour = behaviourDescriptions[summary.behaviourType];
  const BehaviourIcon = behaviour.icon;

  // Emotion-based patterns
  const emotionStats: Record<string, { count: number; total: number }> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    if (t.emotionTag) {
      if (!emotionStats[t.emotionTag]) {
        emotionStats[t.emotionTag] = { count: 0, total: 0 };
      }
      emotionStats[t.emotionTag].count++;
      emotionStats[t.emotionTag].total += t.amount;
    }
  });

  const emotionLabels: Record<string, { label: string; icon: typeof Heart; color: string }> = {
    need: { label: 'Essential Needs', icon: Target, color: 'text-green-600' },
    impulse: { label: 'Impulse Buys', icon: Zap, color: 'text-orange-500' },
    stress: { label: 'Stress Spending', icon: AlertTriangle, color: 'text-red-500' },
    celebration: { label: 'Celebrations', icon: Sparkles, color: 'text-purple-500' },
  };

  // Top spending category
  const topCategory = Object.entries(summary.categoryBreakdown)
    .sort(([, a], [, b]) => b - a)[0];

  // Spending frequency
  const spendingFrequencyLabels = {
    rarely: 'You spend sparingly - great discipline!',
    sometimes: 'You have moderate spending habits.',
    often: 'You spend frequently. Consider consolidating purchases.',
    always: 'You spend very frequently. This might lead to overspending.',
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-7 w-7 text-primary" />
            Insights
          </h1>
          <p className="text-muted-foreground text-sm">
            Understand your spending patterns and behaviours
          </p>
        </div>

        {/* Behaviour Type Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-background flex items-center justify-center ${behaviour.color}`}>
                <BehaviourIcon className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl">{behaviour.title}</CardTitle>
                <CardDescription className="mt-1">{behaviour.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-background/80 rounded-lg p-4">
              <p className="text-sm flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>Tip:</strong> {behaviour.tip}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">{formatINR(summary.totalExpenses)}</div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">{formatINR(summary.balance)}</div>
              <p className="text-sm text-muted-foreground">Balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Spending Category */}
        {topCategory && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Top Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold capitalize">{topCategory[0]}</p>
                  <p className="text-muted-foreground text-sm">
                    {Math.round((topCategory[1] / summary.totalExpenses) * 100)}% of your total spending
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-destructive">{formatINR(topCategory[1])}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emotion-Based Spending */}
        {Object.keys(emotionStats).length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Emotion-Based Patterns
              </CardTitle>
              <CardDescription>How your emotions influence spending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(emotionStats)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([emotion, stats]) => {
                  const emotionInfo = emotionLabels[emotion];
                  if (!emotionInfo) return null;
                  const EmotionIcon = emotionInfo.icon;
                  
                  return (
                    <div key={emotion} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <EmotionIcon className={`h-5 w-5 ${emotionInfo.color}`} />
                        <div>
                          <p className="font-medium">{emotionInfo.label}</p>
                          <p className="text-xs text-muted-foreground">{stats.count} transactions</p>
                        </div>
                      </div>
                      <span className="font-bold">{formatINR(stats.total)}</span>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}

        {/* Spending Habits */}
        {user && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Spending Habits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1">Spending Frequency</p>
                <p className="text-sm text-muted-foreground">
                  {spendingFrequencyLabels[user.spendingFrequency]}
                </p>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1">Planning Habit</p>
                <p className="text-sm text-muted-foreground">
                  {user.plansBeforeSpending 
                    ? '✅ You usually plan before spending - this helps avoid impulse purchases!'
                    : '⚠️ You tend to spend without planning. Try creating a shopping list before going out.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Generated Insights */}
        {insights.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Personalized Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{insight.icon}</span>
                    <p className="font-medium">{insight.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Savings Tips */}
        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-700">💡 Saving Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Set a weekly "no-spend" day to reduce unnecessary expenses.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Track every expense, no matter how small.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Use the 50/30/20 rule: Needs / Wants / Savings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Before buying, ask: "Do I need this or just want it?"</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Insights;
