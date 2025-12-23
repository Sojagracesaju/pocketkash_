import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFinance } from '@/contexts/FinanceContext';
import { useUser } from '@/contexts/UserContext';
import { formatINR } from '@/lib/utils';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your PocketKash assistant. Ask me anything about your finances, spending patterns, or saving tips!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { transactions, getSummary } = useFinance();
  const { user } = useUser();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = (question: string): string => {
    const lowerQ = question.toLowerCase();
    const summary = getSummary();

    // Today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayExpenses = transactions.filter(t => {
      const transDate = new Date(t.date);
      transDate.setHours(0, 0, 0, 0);
      return transDate.getTime() === today.getTime() && t.type === 'expense';
    });
    const spentToday = todayExpenses.reduce((sum, t) => sum + t.amount, 0);
    const remainingToday = (user?.dailyLimit || 0) - spentToday;

    // Spending analysis
    const impulseSpending = transactions.filter(t => t.emotionTag === 'impulse').reduce((sum, t) => sum + t.amount, 0);
    const stressSpending = transactions.filter(t => t.emotionTag === 'stress').reduce((sum, t) => sum + t.amount, 0);

    // Top category
    const topCategory = Object.entries(summary.categoryBreakdown).sort(([, a], [, b]) => b - a)[0];

    // Response logic
    if (lowerQ.includes('how much') && (lowerQ.includes('spent') || lowerQ.includes('spend'))) {
      if (lowerQ.includes('today')) {
        return `You've spent ${formatINR(spentToday)} today. ${remainingToday > 0 ? `You have ${formatINR(remainingToday)} left within your daily limit.` : 'You\'ve exceeded your daily limit!'}`;
      }
      return `Your total expenses so far are ${formatINR(summary.totalExpenses)}. Your balance is ${formatINR(summary.balance)}.`;
    }

    if (lowerQ.includes('why') && lowerQ.includes('overspend')) {
      const reasons = [];
      if (impulseSpending > summary.totalExpenses * 0.2) {
        reasons.push(`impulse purchases (${formatINR(impulseSpending)})`);
      }
      if (stressSpending > summary.totalExpenses * 0.1) {
        reasons.push(`stress-related spending (${formatINR(stressSpending)})`);
      }
      if (topCategory && topCategory[1] > summary.totalExpenses * 0.4) {
        reasons.push(`high ${topCategory[0]} expenses (${formatINR(topCategory[1])})`);
      }
      if (reasons.length > 0) {
        return `Based on your data, you might be overspending due to: ${reasons.join(', ')}. Try to be mindful of these patterns!`;
      }
      return "I don't see major overspending patterns. Keep tracking your expenses to get better insights!";
    }

    if (lowerQ.includes('save') || lowerQ.includes('saving')) {
      return `Here are some tips based on your spending:\n\n1. ${topCategory ? `You spend most on ${topCategory[0]}. Try reducing it by 20%.` : 'Track all expenses to find where to cut.'}\n2. ${impulseSpending > 0 ? 'Your impulse spending is ' + formatINR(impulseSpending) + '. Use the 24-hour rule before buying.' : 'Great job avoiding impulse purchases!'}\n3. Set a "no-spend" day once a week.\n4. Before buying, ask: "Do I need this or want this?"`;
    }

    if (lowerQ.includes('where') && lowerQ.includes('money') && lowerQ.includes('go')) {
      const categories = Object.entries(summary.categoryBreakdown)
        .sort(([, a], [, b]) => b - a)
        .map(([cat, amt]) => `${cat}: ${formatINR(amt)}`)
        .join('\n');
      return `Here's where your money is going:\n\n${categories}\n\nTotal spent: ${formatINR(summary.totalExpenses)}`;
    }

    if (lowerQ.includes('limit') || lowerQ.includes('budget')) {
      return `Your current limits:\n• Daily: ${formatINR(user?.dailyLimit || 0)}\n• Weekly: ${user?.weeklyLimit ? formatINR(user.weeklyLimit) : 'Not set'}\n• Monthly: ${user?.monthlyLimit ? formatINR(user.monthlyLimit) : 'Not set'}\n\nYou can update these in your Profile settings.`;
    }

    if (lowerQ.includes('behaviour') || lowerQ.includes('behavior') || lowerQ.includes('type')) {
      const behaviourTypes = {
        planned: "You're a Planned Spender! You think before spending and manage money wisely. Keep it up!",
        impulsive: "You tend to be an Impulsive Spender. Try waiting 24 hours before making non-essential purchases.",
        'frequent-small': "You're a Frequent Small Spender. Those coffee runs and snacks add up! Try tracking every small expense.",
      };
      return behaviourTypes[summary.behaviourType];
    }

    if (lowerQ.includes('impulse')) {
      return impulseSpending > 0
        ? `You've spent ${formatINR(impulseSpending)} on impulse purchases. That's ${Math.round((impulseSpending / summary.totalExpenses) * 100)}% of your total spending. Try the 24-hour rule: wait a day before buying non-essentials.`
        : "Great news! You haven't logged any impulse purchases. Keep being mindful with your spending!";
    }

    if (lowerQ.includes('stress')) {
      return stressSpending > 0
        ? `You've spent ${formatINR(stressSpending)} during stressful moments. Consider healthier alternatives like exercise, talking to friends, or meditation when you feel stressed.`
        : "You haven't logged stress-related spending. That's great for your wallet and wellbeing!";
    }

    if (lowerQ.includes('hello') || lowerQ.includes('hi') || lowerQ.includes('hey')) {
      return `Hello${user?.name ? `, ${user.name}` : ''}! I'm here to help you understand your spending and save better. What would you like to know?`;
    }

    // Default response
    return "I can help you with:\n• How much you've spent (today/total)\n• Why you might be overspending\n• Where your money is going\n• Saving tips\n• Your spending behaviour type\n• Budget limits\n\nTry asking one of these!";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 500 + Math.random() * 500);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-20 md:bottom-6 right-4 z-50"
          >
            <Button
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 md:bottom-6 right-4 z-50 w-[calc(100%-2rem)] max-w-sm"
          >
            <Card className="shadow-2xl border-primary/20">
              <CardHeader className="pb-2 bg-primary/5 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    PocketKash AI
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Messages */}
                <ScrollArea className="h-80 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-3 text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder="Ask about your spending..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
