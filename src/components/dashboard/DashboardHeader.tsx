import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  onAddTransaction: () => void;
}

const DashboardHeader = ({ onAddTransaction }: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PocketKash</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button onClick={onAddTransaction} size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Transaction
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/">
                <LogOut className="h-4 w-4 mr-2" /> Exit Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
