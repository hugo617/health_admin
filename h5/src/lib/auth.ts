export interface User {
  id: number;
  email: string;
  username?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export class AuthManager {
  private static instance: AuthManager;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  getAuthState(): AuthState {
    if (typeof window === 'undefined') {
      return { user: null, token: null, isAuthenticated: false };
    }

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    return {
      user,
      token,
      isAuthenticated: !!(token && user)
    };
  }

  setAuthState(token: string, user: User) {
    if (typeof window === 'undefined') return;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearAuthState() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  requireAuth() {
    const { isAuthenticated } = this.getAuthState();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return false;
    }
    return true;
  }
}