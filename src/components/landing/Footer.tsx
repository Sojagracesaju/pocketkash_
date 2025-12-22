import { Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-12 bg-background border-t border-border">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PocketKash</span>
          </Link>

          <p className="text-muted-foreground text-sm">
            © 2024 PocketKash. Built for college students who want to manage money better.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
