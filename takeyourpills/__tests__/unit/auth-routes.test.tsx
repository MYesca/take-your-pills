import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { PublicClientApplication, InteractionStatus } from '@azure/msal-browser';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SessionProvider } from '@/components/auth/SessionProvider';

// Mock next/navigation
const mockRouterPush = vi.fn();
const mockUsePathname = vi.fn(() => '/dashboard');

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
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

describe('ProtectedRoute Component', () => {
  const mockMsalInstance = createMockMsalInstance();
  const user = { name: 'Test User' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouterPush.mockClear();
    mockUsePathname.mockReturnValue('/dashboard');
    mockUseIsAuthenticatedReturn = false;
    mockUseMsalReturn = {
      instance: mockMsalInstance,
      accounts: [],
      inProgress: InteractionStatus.None,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('should show loading state while checking authentication', () => {
    mockUseMsalReturn = {
      instance: mockMsalInstance,
      accounts: [],
      inProgress: InteractionStatus.Startup,
    };

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', async () => {
    mockUseIsAuthenticatedReturn = false;
    mockUseMsalReturn = {
      instance: mockMsalInstance,
      accounts: [],
      inProgress: InteractionStatus.None,
    };

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith('/login?redirect=%2Fdashboard');
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when authenticated', () => {
    mockUseIsAuthenticatedReturn = true;
    mockUseMsalReturn = {
      instance: mockMsalInstance,
      accounts: [user as any],
      inProgress: InteractionStatus.None,
    };

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('should not redirect if already on login page', async () => {
    mockUsePathname.mockReturnValue('/login');
    mockUseIsAuthenticatedReturn = false;

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      // Should not redirect if already on login page
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });
});

describe('SessionProvider Component', () => {
  const mockMsalInstance = createMockMsalInstance();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRouterPush.mockClear();
    mockUsePathname.mockReturnValue('/dashboard');
    mockUseIsAuthenticatedReturn = false;
    mockUseMsalReturn = {
      instance: mockMsalInstance,
      accounts: [],
      inProgress: InteractionStatus.None,
    };
  });

  afterEach(() => {
    cleanup();
  });

  it('should not redirect when authentication state is stable', () => {
    mockUseIsAuthenticatedReturn = true;
    mockUseMsalReturn = {
      instance: mockMsalInstance,
      accounts: [{ name: 'Test User' } as any],
      inProgress: InteractionStatus.None,
    };

    render(
      <SessionProvider>
        <div>App Content</div>
      </SessionProvider>
    );

    expect(screen.getByText('App Content')).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('should not redirect when on login page', () => {
    mockUsePathname.mockReturnValue('/login');
    mockUseIsAuthenticatedReturn = false;

    const { container } = render(
      <SessionProvider>
        <div>App Content</div>
      </SessionProvider>
    );

    expect(container.textContent).toContain('App Content');
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('should not redirect when on API routes', () => {
    mockUsePathname.mockReturnValue('/api/auth/me');
    mockUseIsAuthenticatedReturn = false;

    const { container } = render(
      <SessionProvider>
        <div>App Content</div>
      </SessionProvider>
    );

    expect(container.textContent).toContain('App Content');
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});
