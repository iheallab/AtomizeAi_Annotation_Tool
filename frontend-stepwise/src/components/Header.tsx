import React from 'react';
import { Heart, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className='bg-card shadow-soft sticky top-0 z-10 py-3 px-6 border-none'>
      <div className='max-w-8xl mx-auto flex justify-between items-center'>
        <div className='flex items-center'>
          <Heart className='text-primary mr-2 heart-beats' size={20} />
          <h1 className='text-xl font-semibold text-foreground'>
            Medical Annotation Tool
          </h1>
        </div>

        <div className='flex items-center gap-4'>
          <div className='text-sm text-muted-foreground'>
            Logged in as{' '}
            <span className='font-medium'>{user?.username || 'User'}</span>
          </div>

          {/* <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleTheme}
            className="flex items-center gap-1 bg-secondary border-none shadow-soft"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={16} className="text-amber-400" />
                <span className="md:inline hidden">Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={16} className="text-primary" />
                <span className="md:inline hidden">Dark Mode</span>
              </>
            )}
          </Button> */}

          <Button
            variant='ghost'
            size='sm'
            onClick={logout}
            className='flex items-center gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive/90'
          >
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
