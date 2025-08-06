import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { useAtomValue } from 'jotai';
import { isFirstTimeLoginAtom } from '@/atoms/atoms';

// Extend JwtPayload to include Google-specific fields
interface GoogleJwtPayload extends JwtPayload {
  sub: string; // Unique Google ID
  name: string; // Full name
  given_name?: string; // First name (optional)
  family_name?: string; // Last name (optional)
  email: string; // Email address
  picture: string; // Profile picture URL
}

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const isFirstTimeLogin = useAtomValue(isFirstTimeLoginAtom);
  const [clickSignInWithGoogle, setClickSignInWithGoogle] = useState(false);
  const [googleLoginSuccess, setGoogleLoginSuccess] = useState(false);
  const {
    login,
    ifUserLinksWithGoogle,
    user,
    isLoading,
    linkUserWithGoogle,
    changePassword,
  } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      await login(username, password);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      await changePassword(username, password);
    }
  };

  const handleLinkUserWithGoogle = async (email: string, username: string) => {
    await linkUserWithGoogle(email, username);
  };

  if (user) {
    return <Navigate to='/' />;
  }

  return (
    <GoogleOAuthProvider clientId='911337074821-4e6lo90tgkl5k3f1sg6rhi2rt4j6djlf.apps.googleusercontent.com'>
      <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='space-y-1 flex flex-col items-center'>
            <Heart className='text-blue-600' size={32} />
            <CardTitle className='text-2xl'>
              ICU-REACT Dataset Annotation Tool
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the annotation platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!clickSignInWithGoogle && !isFirstTimeLogin && (
              <>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='username'>Username</Label>
                    <Input
                      id='username'
                      placeholder='Enter your username'
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='password'>Password</Label>
                    <Input
                      id='password'
                      type='password'
                      placeholder='Enter your password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type='submit' className='w-full' disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>

                <div className='w-100 d-flex justify-content-center mt-4'>
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      setClickSignInWithGoogle(true);
                      const decodedCredential: GoogleJwtPayload = jwtDecode(
                        credentialResponse.credential!
                      );
                      const email = decodedCredential.email;
                      setEmail(email);
                      const res = await ifUserLinksWithGoogle(email);
                      if (res.exists) {
                        setGoogleLoginSuccess(true);
                        await login(res.user.username, res.user.username);
                      } else {
                        setGoogleLoginSuccess(false);
                      }
                    }}
                    size='large'
                    width={400}
                    onError={() => {
                      setClickSignInWithGoogle(true);
                    }}
                  />
                </div>
              </>
            )}

            {isFirstTimeLogin && (
              <div className='text-center space-y-6'>
                <div className='flex flex-col items-center space-y-3'>
                  <div className='w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg'>
                    <svg
                      className='w-8 h-8 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                      />
                    </svg>
                  </div>
                  <div className='space-y-2'>
                    <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                      Welcome! Please Set Your Password
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400 max-w-sm'>
                      For security, please change your default password to
                      something only you know.
                    </p>
                  </div>
                </div>

                {/* Password change form */}
                <form onSubmit={handleSetPassword} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='newPassword'>New Password</Label>
                    <Input
                      id='newPassword'
                      type='password'
                      placeholder='Enter your new password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword'>Confirm Password</Label>
                    <Input
                      id='confirmPassword'
                      type='password'
                      placeholder='Confirm your new password'
                      required
                    />
                  </div>

                  <Button
                    type='submit'
                    className='w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200'
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className='flex items-center space-x-2'>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        <span>Setting Password...</span>
                      </div>
                    ) : (
                      <div className='flex items-center space-x-2'>
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                        <span>Set Password & Continue</span>
                      </div>
                    )}
                  </Button>
                </form>
              </div>
            )}

            {clickSignInWithGoogle && !googleLoginSuccess && (
              <>
                <div className='text-center space-y-6'>
                  {/* Header with icon */}
                  <div className='flex flex-col items-center space-y-3'>
                    <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg'>
                      <svg
                        className='w-8 h-8 text-white'
                        fill='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
                      </svg>
                    </div>
                    <div className='space-y-2'>
                      <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                        Link Your Account
                      </h3>
                      <p className='text-sm text-gray-600 dark:text-gray-400 max-w-sm'>
                        We found your Google account! Please enter the username
                        we assigned to you to complete the linking process.
                      </p>
                    </div>
                  </div>

                  {/* Google account info */}
                  <div className='bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm'>
                        <svg className='w-6 h-6' viewBox='0 0 24 24'>
                          <path
                            fill='#4285F4'
                            d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                          />
                          <path
                            fill='#34A853'
                            d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                          />
                          <path
                            fill='#FBBC05'
                            d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                          />
                          <path
                            fill='#EA4335'
                            d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                          />
                        </svg>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                          {email}
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Google Account
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Username input */}
                  <div className='space-y-3'>
                    <Label
                      htmlFor='username'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      Your Assigned Username
                    </Label>
                    <div className='relative'>
                      <Input
                        id='username'
                        placeholder='Enter your username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className='pl-10 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-colors'
                      />
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <svg
                          className='h-5 w-5 text-gray-400'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className='space-y-3 pt-4'>
                    <Button
                      className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200'
                      disabled={isLoading}
                      onClick={() => handleLinkUserWithGoogle(email, username)}
                    >
                      {isLoading ? (
                        <div className='flex items-center space-x-2'>
                          <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                          <span>Linking Account...</span>
                        </div>
                      ) : (
                        <div className='flex items-center space-x-2'>
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M13 10V3L4 14h7v7l9-11h-7z'
                            />
                          </svg>
                          <span>Link Account</span>
                        </div>
                      )}
                    </Button>

                    <Button
                      variant='outline'
                      className='w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                      disabled={isLoading}
                      onClick={() => setClickSignInWithGoogle(false)}
                    >
                      <svg
                        className='w-4 h-4 mr-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M10 19l-7-7m0 0l7-7m-7 7h18'
                        />
                      </svg>
                      Back to Login
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
