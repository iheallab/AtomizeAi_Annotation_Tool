import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Mail, Briefcase, Award } from 'lucide-react';
import { UserType } from '@/types';

interface UserProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
}

export const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  // Placeholder values for jobTitle and specialization
  // These should be updated when the backend provides this data
  const jobTitle = 'Annotator'; // Placeholder
  const specialization = 'Medical Data Annotation'; // Placeholder

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <User className='h-5 w-5' />
            User Profile
          </DialogTitle>
          <DialogDescription>
            Your account information and profile details
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Profile Header */}
          <div className='flex items-center space-x-4'>
            <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
              <User size={24} className='text-primary' />
            </div>
            <div>
              <h3 className='text-lg font-semibold'>{user.username}</h3>
              {/* <p className='text-sm text-muted-foreground'>{jobTitle}</p> */}
            </div>
          </div>

          {/* Profile Information */}
          <div className='space-y-4'>
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground uppercase tracking-wide'>
                Personal Information
              </h4>

              <div className='space-y-3'>
                {/* Username */}
                <div className='flex items-center space-x-3 p-3 bg-muted/50 rounded-lg'>
                  <User className='h-4 w-4 text-muted-foreground' />
                  <div className='flex-1'>
                    <p className='text-xs text-muted-foreground'>Username</p>
                    <p className='text-sm font-medium'>{user.username}</p>
                  </div>
                </div>

                {/* Email */}
                <div className='flex items-center space-x-3 p-3 bg-muted/50 rounded-lg'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <div className='flex-1'>
                    <p className='text-xs text-muted-foreground'>
                      Email Address
                    </p>
                    <p className='text-sm font-medium'>{user.email}</p>
                  </div>
                </div>

                {/* Job Title */}
                {/* <div className='flex items-center space-x-3 p-3 bg-muted/50 rounded-lg'>
                  <Briefcase className='h-4 w-4 text-muted-foreground' />
                  <div className='flex-1'>
                    <p className='text-xs text-muted-foreground'>Job Title</p>
                    <p className='text-sm font-medium'>{jobTitle}</p>
                  </div>
                </div> */}

                {/* Specialization */}
                {/* <div className='flex items-center space-x-3 p-3 bg-muted/50 rounded-lg'>
                  <Award className='h-4 w-4 text-muted-foreground' />
                  <div className='flex-1'>
                    <p className='text-xs text-muted-foreground'>
                      Specialization
                    </p>
                    <p className='text-sm font-medium'>{specialization}</p>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Account Information */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-muted-foreground uppercase tracking-wide'>
                Account Information
              </h4>

              <div className='flex items-center space-x-3 p-3 bg-muted/50 rounded-lg'>
                <div className='h-4 w-4 rounded-full bg-green-500 flex items-center justify-center'>
                  <div className='h-2 w-2 rounded-full bg-white'></div>
                </div>
                <div className='flex-1'>
                  <p className='text-xs text-muted-foreground'>Status</p>
                  <p className='text-sm font-medium text-green-600'>Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
