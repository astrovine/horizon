import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Home, Compass, Bell, User, LogOut, Rss, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/feed', icon: Rss, label: 'Feed' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-72 border-r border-border px-2 bg-background">
        <div className="flex flex-col h-full py-2">
          {/* Navigation Items */}
          <div className="flex-1 space-y-1 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-5 px-3 py-3 rounded-full transition-colors ${
                  isActive(item.path)
                    ? 'font-bold text-foreground'
                    : 'font-normal text-muted-foreground hover:bg-accent'
                }`}
              >
                <item.icon size={26} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                <span className="text-xl">{item.label}</span>
              </Link>
            ))}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-5 px-3 py-3 rounded-full transition-colors font-normal text-muted-foreground hover:bg-accent w-full"
            >
              {theme === 'dark' ? <Sun size={26} strokeWidth={2} /> : <Moon size={26} strokeWidth={2} />}
              <span className="text-xl">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          {/* User info */}
          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-3 rounded-full hover:bg-accent w-full transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-lg font-semibold text-primary-foreground">
                  {user?.name?.[0]?.toUpperCase() || user?.user_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-[15px] text-foreground">{user?.name || user?.user_name || 'User'}</p>
                <p className="text-[15px] text-muted-foreground">@{user?.user_name || 'user'}</p>
              </div>
              <LogOut size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
        <div className="flex justify-around items-center h-[53px]">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <item.icon
                size={26}
                strokeWidth={isActive(item.path) ? 2.5 : 2}
                className={isActive(item.path) ? 'text-foreground' : 'text-muted-foreground'}
              />
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center justify-center flex-1 h-full"
          >
            {theme === 'dark' ?
              <Sun size={26} strokeWidth={2} className="text-muted-foreground" /> :
              <Moon size={26} strokeWidth={2} className="text-muted-foreground" />
            }
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
