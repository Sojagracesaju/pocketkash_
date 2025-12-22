import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowRight, TrendingDown, Brain, PiggyBank } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Wallet,
    title: 'Track where your money actually goes',
    description: 'Every rupee counts. Know exactly what you spend and when.',
  },
  {
    icon: Brain,
    title: 'Understand your spending behaviour',
    description: 'Are you impulsive or planned? Discover your financial personality.',
  },
  {
    icon: TrendingDown,
    title: 'Detect money leaks early',
    description: 'Small expenses add up. We help you spot them before they drain you.',
  },
  {
    icon: PiggyBank,
    title: 'Build better saving habits',
    description: 'Set limits, get alerts, and watch your savings grow.',
  },
];

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after logo animation
    const timer = setTimeout(() => setShowContent(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!showContent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
            <Wallet className="h-12 w-12 text-primary-foreground" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-4xl font-bold text-foreground"
          >
            PocketKash
          </motion.h1>
        </motion.div>
      </div>
    );
  }

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/20">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />

      {/* Skip button */}
      <div className="absolute top-6 right-6 z-10">
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          Skip
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
              <CurrentIcon className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              {slides[currentSlide].title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="p-6 pb-10 relative z-10">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-primary'
                  : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Continue button */}
        <Button onClick={handleNext} className="w-full max-w-sm mx-auto flex" size="lg">
          {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default SplashScreen;
