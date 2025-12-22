import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, Plus, Calendar, CalendarDays, CalendarRange, Lightbulb, User, Wallet, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
  onAddExpense?: () => void;
}

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Daily', url: '/daily', icon: Calendar },
  { title: 'Weekly', url: '/weekly', icon: CalendarDays },
  { title: 'Monthly', url: '/monthly', icon: CalendarRange },
  { title: 'Insights', url: '/insights', icon: Lightbulb },
  { title: 'Profile', url: '/profile', icon: User },
];

const AppLayout = ({ children, onAddExpense }: AppLayoutProps) => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex border-r border-border">
          <div className="p-4 border-b border-border">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">PocketKash</span>
            </Link>
          </div>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          end 
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                          activeClassName="bg-primary/10 text-primary font-medium"
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Add Expense button in sidebar */}
          {onAddExpense && (
            <div className="p-4 mt-auto border-t border-border">
              <Button onClick={onAddExpense} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          )}
        </Sidebar>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile header */}
          <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Wallet className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">PocketKash</span>
            </Link>
            <SidebarTrigger>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>

          {/* Mobile bottom navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 flex justify-around items-center z-40">
            {navItems.slice(0, 5).map((item) => (
              <Link
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  location.pathname === item.url 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px]">{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
