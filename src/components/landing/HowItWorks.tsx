import { UserPlus, Target, TrendingUp } from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: 'Quick Setup',
    description: 'Tell us about yourself, your income, and spending habits in just 2 minutes.',
  },
  {
    step: 2,
    icon: Target,
    title: 'Set Your Limits',
    description: 'Define daily, weekly, and monthly spending limits that work for your lifestyle.',
  },
  {
    step: 3,
    icon: TrendingUp,
    title: 'Track & Improve',
    description: 'Add expenses, get smart alerts, and watch your financial habits transform.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start managing your finances in three simple steps
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-border" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((item) => (
                <div key={item.step} className="relative flex flex-col items-center text-center">
                  {/* Step number badge */}
                  <div className="relative z-10 mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                      <item.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{item.step}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
