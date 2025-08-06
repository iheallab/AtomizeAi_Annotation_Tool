import React, { useState } from 'react';
import { User, Settings, LogOut, ChevronDown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { ChangePasswordDialog } from './ChangePasswordDialog';

interface UserProfileMenuProps {
  username: string;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  username,
}) => {
  const { logout } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex items-center gap-2 px-3 py-2 hover:bg-secondary/50'
          >
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center'>
                <User size={16} className='text-primary' />
              </div>
              <span className='text-sm font-medium'>{username}</span>
              <ChevronDown size={14} className='text-muted-foreground' />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-56'>
          <DropdownMenuLabel>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>{username}</p>
              <p className='text-xs leading-none text-muted-foreground'>
                User Account
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Settings size={16} className='mr-2' />
              Settings
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
                <Lock size={16} className='mr-2' />
                Change Password
              </DropdownMenuItem>
              {/* Future settings can be added here */}
              {/* <DropdownMenuItem>
                <User size={16} className='mr-2' />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell size={16} className='mr-2' />
                Notifications
              </DropdownMenuItem> */}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className='text-destructive'>
            <LogOut size={16} className='mr-2' />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        username={username}
      />
    </>
  );
};
