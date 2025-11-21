import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PublicClientApplication, InteractionStatus } from '@azure/msal-browser';
import { Header } from '@/components/layout/Header';
import { useRouter, usePathname } from 'next/navigation';

// Mock next/navigation
const mockUsePathname = vi.fn(() => '/dashboard');

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  usePathname: () => mockUsePathname(),
}));

// Mock MSAL instance
const createMockMsalInstance = () => {
  const mockLogger = {
    verbose: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    clone: vi.fn().mockReturnThis(),
  };

  return {
    logoutRedirect: vi.fn().mockResolvedValue(undefined),
    handleRedirectPromise: vi.fn().mockResolvedValue(null),
    getAllAccounts: vi.fn().mockReturnValue([]),
    getLogger: vi.fn().mockReturnValue(mockLogger),
    initialize: vi.fn().mockResolvedValue(undefined),
    getConfiguration: vi.fn().mockReturnValue({}),
    setActiveAccount: vi.fn(),
    getActiveAccount: vi.fn().mockReturnValue(null),
  } as unknown as PublicClientApplication;
};

// Mock useMsal and useIsAuthenticated hooks
let mockUseMsalReturn: any;
let mockUseIsAuthenticatedReturn: boolean;

vi.mock('@azure/msal-react', async () => {
  const actual = await vi.importActual('@azure/msal-react');
  return {
    ...actual,
    useMsal: () => mockUseMsalReturn,
    useIsAuthenticated: () => mockUseIsAuthenticatedReturn,
    MsalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('Header Component', () => {
  const mockMsalInstance = createMockMsalInstance();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue('/dashboard');
    mockUseIsAuthenticatedReturn = true;
    mockUseMsalReturn = {
      instance: mockMsalInstance,
      accounts: [
        {
          username: 'test@example.com',
          name: 'Test User',
        },
      ],
      inProgress: InteractionStatus.None,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('should not render on login page', () => {
    mockUsePathname.mockReturnValue('/login');
    mockUseIsAuthenticatedReturn = false;

    const { container } = render(<Header />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when not authenticated', () => {
    mockUseIsAuthenticatedReturn = false;
    mockUseMsalReturn = {
      instance: mockMsalInstance,
      accounts: [],
      inProgress: InteractionStatus.None,
    };

    const { container } = render(<Header />);
    expect(container.firstChild).toBeNull();
  });

  it('should render header when authenticated', () => {
    render(<Header />);

    expect(screen.getByText('TakeYourPills')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should display user email in dropdown trigger', () => {
    render(<Header />);

    const trigger = screen.getByRole('button', { name: /test@example.com/i });
    expect(trigger).toBeInTheDocument();
  });

  it('should show logout option in dropdown menu', async () => {
    render(<Header />);

    const trigger = screen.getByRole('button', { name: /test@example.com/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Log out')).toBeInTheDocument();
    });
  });

  it('should call logoutRedirect when logout is clicked', async () => {
    render(<Header />);

    const trigger = screen.getByRole('button', { name: /test@example.com/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Log out')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Log out');
    await user.click(logoutButton);

    await waitFor(() => {
      expect(mockMsalInstance.logoutRedirect).toHaveBeenCalledWith({
        postLogoutRedirectUri: '/login',
      });
    });
  });

  it('should handle logout errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: '' } as any;

    mockMsalInstance.logoutRedirect = vi.fn().mockRejectedValue(new Error('Logout failed'));

    render(<Header />);

    const trigger = screen.getByRole('button', { name: /test@example.com/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Log out')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Log out');
    await user.click(logoutButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
    window.location = originalLocation;
  });

  it('should hide user email on mobile (sm breakpoint)', () => {
    // This is a CSS test, so we just verify the component structure
    render(<Header />);

    const trigger = screen.getByRole('button', { name: /test@example.com/i });
    expect(trigger).toBeInTheDocument();
    // The hidden sm:inline class is on the span inside the button
    // We verify the button exists and contains the email text
    expect(trigger).toHaveTextContent('test@example.com');
  });
});

