import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Insight } from '@/types/finance';

interface InsightsPanelProps {
  insights: Insight[];
}

const InsightsPanel = ({ insights }: InsightsPanelProps) => {
  const typeStyles: Record<string, string> = {
    behaviour: 'bg-primary/10 border-primary/20',
    leak: 'bg-orange-100 border-orange-200',
    saving: 'bg-green-100 border-green-200',
    alert: 'bg-red-100 border-red-200',
  };

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Smart Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Add more transactions to get personalized insights!
          </p>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-xl border ${typeStyles[insight.type] || 'bg-muted'}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{insight.icon}</span>
                <div>
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;
