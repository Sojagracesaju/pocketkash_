import { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SummaryCards from '@/components/dashboard/SummaryCards';
import SpendingChart from '@/components/dashboard/SpendingChart';
import InsightsPanel from '@/components/dashboard/InsightsPanel';
import TransactionList from '@/components/dashboard/TransactionList';
import AddTransactionModal from '@/components/dashboard/AddTransactionModal';
import { useFinance } from '@/contexts/FinanceContext';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/types/finance';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { transactions, addTransaction, deleteTransaction, getSummary, getInsights } = useFinance();
  const { toast } = useToast();

  const summary = getSummary();
  const insights = getInsights();

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
    <div className="min-h-screen bg-background">
      <DashboardHeader onAddTransaction={() => setIsModalOpen(true)} />
      
      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your spending and discover insights about your habits.</p>
        </div>

        <div className="space-y-6">
          <SummaryCards summary={summary} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingChart categoryBreakdown={summary.categoryBreakdown} />
            <InsightsPanel insights={insights} />
          </div>
          
          <TransactionList 
            transactions={transactions} 
            onDelete={handleDeleteTransaction}
          />
        </div>
      </main>

      <AddTransactionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  );
};

export default Dashboard;
