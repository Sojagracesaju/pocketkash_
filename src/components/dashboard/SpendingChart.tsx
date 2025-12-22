import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ExpenseCategory } from '@/types/finance';

interface SpendingChartProps {
  categoryBreakdown: Record<ExpenseCategory, number>;
}

const categoryColors: Record<ExpenseCategory, string> = {
  food: 'hsl(328, 85%, 70%)',
  travel: 'hsl(351, 94%, 71%)',
  shopping: 'hsl(327, 87%, 81%)',
  entertainment: 'hsl(352, 95%, 81%)',
  others: 'hsl(240, 3%, 46%)',
};

const categoryLabels: Record<ExpenseCategory, string> = {
  food: 'Food',
  travel: 'Travel',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  others: 'Others',
};

const SpendingChart = ({ categoryBreakdown }: SpendingChartProps) => {
  const data = Object.entries(categoryBreakdown)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: categoryLabels[key as ExpenseCategory],
      value,
      color: categoryColors[key as ExpenseCategory],
    }));

  if (data.length === 0) {
    return (
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No expenses recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`₹${value}`, '']}
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SpendingChart;
