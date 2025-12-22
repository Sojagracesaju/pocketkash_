import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingDown, Clock } from 'lucide-react';

interface SmartAlert {
  id: string;
  type: 'warning' | 'info' | 'danger';
  title: string;
  message: string;
}

interface SmartAlertsProps {
  alerts: SmartAlert[];
}

const SmartAlerts = ({ alerts }: SmartAlertsProps) => {
  if (alerts.length === 0) return null;

  const getAlertIcon = (type: SmartAlert['type']) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-accent-foreground" />;
      case 'danger':
        return <TrendingDown className="h-5 w-5 text-destructive" />;
      case 'info':
        return <Clock className="h-5 w-5 text-primary" />;
    }
  };

  const getAlertStyles = (type: SmartAlert['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-accent/50 border-accent-foreground/20';
      case 'danger':
        return 'bg-destructive/10 border-destructive/20';
      case 'info':
        return 'bg-primary/10 border-primary/20';
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Smart Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-3 rounded-xl border ${getAlertStyles(alert.type)}`}
          >
            <div className="shrink-0 mt-0.5">{getAlertIcon(alert.type)}</div>
            <div className="text-sm">
              <p className="font-medium">{alert.title}</p>
              <p className="text-muted-foreground">{alert.message}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartAlerts;
export type { SmartAlert };
