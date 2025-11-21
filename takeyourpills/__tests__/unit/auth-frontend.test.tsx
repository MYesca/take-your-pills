/**
 * Unit Tests for Frontend Authentication
 * 
 * Tests for login page and MSAL authentication flow
 * Note: Full MSAL provider mocking is complex, so these tests focus on
 * component rendering and basic interaction logic.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PublicClientApplication, InteractionStatus } from '@azure/msal-browser';
import LoginContent from '@/app/(auth)/login/login-content';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockPush = vi.fn();
const mockGet = vi.fn(() => null);

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock MSAL instance with all required methods
const createMockMsalInstance = () => {
  const mockLogger = {
    verbose: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    clone: vi.fn().mockReturnThis(),
  };

  return {
    loginRedirect: vi.fn().mockResolvedValue(undefined),
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

// Mock fetch for API calls
global.fetch = vi.fn();

describe('LoginContent Component', () => {
  const mockMsalInstance = createMockMsalInstance();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue(null);
    mockUseIsAuthenticatedReturn = false;
    mockUseMsalReturn = {
      instance: mockMsalInstance,
      accounts: [],
      inProgress: InteractionStatus.None,
    };
  });

  it('should render login page with Sign in button', () => {
    render(<LoginContent />);

    expect(screen.getByText('TakeYourPills')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Microsoft')).toBeInTheDocument();
  });

  it('should call loginRedirect when button is clicked', async () => {
    const user = userEvent.setup();

    render(<LoginContent />);

    const loginButtons = screen.getAllByText('Sign in with Microsoft');
    await user.click(loginButtons[0]);

    await waitFor(() => {
      expect(mockMsalInstance.loginRedirect).toHaveBeenCalledWith({
        scopes: ['openid', 'profile', 'email'],
      });
    });
  });

  it('should display error message when authentication fails', async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'error') return 'authentication_failed';
      return null;
    });

    render(<LoginContent />);

    await waitFor(() => {
      expect(screen.getByText(/Authentication Error/i)).toBeInTheDocument();
    });
  });

  it('should show retry button when error occurs', async () => {
    mockGet.mockImplementation((key: string) => {
      if (key === 'error') return 'authentication_failed';
      return null;
    });

    render(<LoginContent />);

    await waitFor(() => {
      const retryButtons = screen.getAllByText('Retry');
      expect(retryButtons.length).toBeGreaterThan(0);
    });
  });

  it('should redirect to dashboard when user is already authenticated', () => {
    mockUseIsAuthenticatedReturn = true;
    mockUseMsalReturn = {
      instance: mockMsalInstance,
      accounts: [{ id: 'test-account' }],
      inProgress: InteractionStatus.None,
    };

    render(<LoginContent />);

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});

