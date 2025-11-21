'use client';

/**
 * Header Component
 * 
 * Displays application header with user menu and logout functionality.
 * Shows user email when authenticated and provides logout button.
 */

import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const pathname = usePathname();

  // Don't show header on login page
  if (pathname === '/login') {
    return null;
  }

  // Get user email from MSAL account
  const userEmail = accounts[0]?.username || accounts[0]?.name || 'User';

  const handleLogout = async () => {
    try {
      // MSAL logoutRedirect automatically:
      // 1. Clears tokens from memory
      // 2. Clears sessionStorage
      // 3. Redirects to login page
      await instance.logoutRedirect({
        postLogoutRedirectUri: '/login',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to redirect to login
      // MSAL should handle cleanup, but we ensure redirect happens
      window.location.href = '/login';
    }
  };

  // Only show header when authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-foreground">TakeYourPills</h1>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{userEmail}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

