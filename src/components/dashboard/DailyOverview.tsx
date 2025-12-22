import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatINR } from '@/lib/utils';
import { Wallet, TrendingDown, AlertCircle } from 'lucide-react';

interface DailyOverviewProps {
  dailyLimit: number;
  spentToday: number;
  routineExpensesRemaining: number;
}

const DailyOverview = ({ dailyLimit, spentToday, routineExpensesRemaining }: DailyOverviewProps) => {
  const remaining = dailyLimit - spentToday;
  const percentUsed = Math.min((spentToday / dailyLimit) * 100, 100);
  const isOverBudget = spentToday > dailyLimit;
  const isNearLimit = remaining < routineExpensesRemaining && !isOverBudget;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          Today's Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{formatINR(dailyLimit)}</p>
            <p className="text-xs text-muted-foreground">Daily Limit</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{formatINR(spentToday)}</p>
            <p className="text-xs text-muted-foreground">Spent Today</p>
          </div>
          <div>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
              {formatINR(Math.abs(remaining))}
            </p>
            <p className="text-xs text-muted-foreground">
              {isOverBudget ? 'Over Budget' : 'Remaining'}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget used</span>
            <span className={isOverBudget ? 'text-destructive font-medium' : ''}>
              {Math.round(percentUsed)}%
            </span>
          </div>
          <Progress 
            value={percentUsed} 
            className={`h-3 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
          />
        </div>

        {/* Smart alert */}
        {isNearLimit && routineExpensesRemaining > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/50 border border-accent-foreground/20">
            <AlertCircle className="h-5 w-5 text-accent-foreground mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-accent-foreground">Heads up!</p>
              <p className="text-muted-foreground">
                You usually spend {formatINR(routineExpensesRemaining)} more today. 
                Spend carefully to stay within your limit.
              </p>
            </div>
          </div>
        )}

        {isOverBudget && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <TrendingDown className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-destructive">Budget Exceeded</p>
              <p className="text-muted-foreground">
                You've spent {formatINR(Math.abs(remaining))} over your daily limit. 
                Try to be mindful tomorrow.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyOverview;
