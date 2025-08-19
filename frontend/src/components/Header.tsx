import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserProfileMenu } from './UserProfileMenu';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <header className='bg-card shadow-soft sticky top-0 z-10 py-3 px-6 border-none'>
      <div className='max-w-8xl mx-auto flex justify-between items-center'>
        <div className='flex items-center'>
          <Heart className='text-primary mr-2 heart-beats' size={20} />
          <h1 className='text-xl font-semibold text-foreground'>
            ICU-REACT Dataset Annotation Tool
          </h1>
        </div>

        <div className='flex items-center gap-4'>
          {user?.role === 'admin' && (
            <Link to={isAdminPage ? '/' : '/admin'}>
              <Button variant='ghost'>
                {isAdminPage ? 'Annotator Page' : 'Admin Dashboard'}
              </Button>
            </Link>
          )}
          <UserProfileMenu user={user} />
        </div>
      </div>
    </header>
  );
};
