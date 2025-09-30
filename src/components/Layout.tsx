import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, BarChart3, Settings, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBack?: boolean;
  showBottomNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showBack = false, showBottomNav = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useApp();

  const handleBack = () => {
    navigate(-1);
  };

  const getHomeRoute = () => {
    if (!user) return '/';
    return `/${user.section}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBack && (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>
        {user && (
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {children}
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <div className="bg-card border-t border-border px-4 py-2">
          <div className="flex justify-around">
            <Button
              variant={location.pathname === getHomeRoute() ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate(getHomeRoute())}
              className="flex flex-col items-center space-y-1"
            >
              <Home className="h-4 w-4" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant={location.pathname.includes('data-entry') ? "default" : "ghost"}
              size="sm"
              className="flex flex-col items-center space-y-1"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs">Data Entry</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center space-y-1"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Reports</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center space-y-1"
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;