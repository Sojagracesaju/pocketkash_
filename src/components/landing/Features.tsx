import { Brain, Eye, Target, Bell, Heart, Lightbulb } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Behaviour Classification',
    description: 'Get classified as a Planned, Impulsive, or Frequent Small Spender based on your patterns.',
  },
  {
    icon: Eye,
    title: 'Money Leak Detection',
    description: 'Identify repeated small expenses that drain your wallet without you noticing.',
  },
  {
    icon: Target,
    title: 'Saving Advice',
    description: 'Personalized suggestions to improve your saving habits and build an emergency fund.',
  },
  {
    icon: Heart,
    title: 'Emotion-Based Analysis',
    description: 'Understand the emotional triggers behind your spending decisions.',
  },
  {
    icon: Bell,
    title: 'Soft Alerts',
    description: 'Non-intrusive notifications when spending patterns change or need attention.',
  },
  {
    icon: Lightbulb,
    title: 'Monthly Reflection',
    description: 'Compare your perception of spending with actual data for better self-awareness.',
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            More Than Just <span className="text-primary">Numbers</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            PocketKash understands your behaviour, not just your balance. 
            Get insights that actually help you change your habits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
