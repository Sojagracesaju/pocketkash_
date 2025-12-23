import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { UserProvider } from "@/contexts/UserContext";
import OnboardingGuard from "@/components/guards/OnboardingGuard";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Daily from "./pages/Daily";
import Weekly from "./pages/Weekly";
import Monthly from "./pages/Monthly";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import AIChatbot from "./components/chat/AIChatbot";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <FinanceProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<OnboardingGuard><Dashboard /><AIChatbot /></OnboardingGuard>} />
                <Route path="/daily" element={<OnboardingGuard><Daily /><AIChatbot /></OnboardingGuard>} />
                <Route path="/weekly" element={<OnboardingGuard><Weekly /><AIChatbot /></OnboardingGuard>} />
                <Route path="/monthly" element={<OnboardingGuard><Monthly /><AIChatbot /></OnboardingGuard>} />
                <Route path="/insights" element={<OnboardingGuard><Insights /><AIChatbot /></OnboardingGuard>} />
                <Route path="/profile" element={<OnboardingGuard><Profile /><AIChatbot /></OnboardingGuard>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </FinanceProvider>
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
