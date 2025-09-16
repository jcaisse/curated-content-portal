import { Page, BrowserContext } from '@playwright/test';

export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Auth helper for E2E tests with cookie isolation
 */
export class AuthHelper {
  private page: Page;
  private context: BrowserContext;

  constructor(page: Page) {
    this.page = page;
    this.context = page.context();
  }

  /**
   * Get default admin credentials from environment or fallback
   */
  private getDefaultCredentials(): AuthCredentials {
    return {
      email: process.env.E2E_ADMIN_EMAIL || 'admin@example.com',
      password: process.env.E2E_ADMIN_PASSWORD || 'gothicgingothicgin12'
    };
  }

  /**
   * Clear all cookies and storage for fresh context
   */
  async clearSession(): Promise<void> {
    await this.context.clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Sign out from any existing session
   */
  async signOut(): Promise<void> {
    try {
      await this.page.goto('/api/auth/signout', { waitUntil: 'networkidle' });
    } catch (error) {
      // Ignore errors if already signed out
    }
  }

  /**
   * Sign in with credentials and return success status
   */
  async signIn(credentials?: AuthCredentials): Promise<boolean> {
    const creds = credentials || this.getDefaultCredentials();
    
    try {
      // Start with fresh session
      await this.clearSession();
      await this.signOut();

      // Navigate to sign in page
      await this.page.goto('/admin');
      await this.page.waitForLoadState('networkidle');

      // Fill in credentials
      await this.page.fill('input[name="email"]', creds.email);
      await this.page.fill('input[name="password"]', creds.password);

      // Submit form
      await this.page.click('button[type="submit"]');
      
      // Wait for redirect or success
      await this.page.waitForLoadState('networkidle');
      
      // Check if we're on admin dashboard (successful login)
      const currentUrl = this.page.url();
      return currentUrl.includes('/admin') && !currentUrl.includes('/signin');
      
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  }

  /**
   * Check if currently signed in
   */
  async isSignedIn(): Promise<boolean> {
    try {
      await this.page.goto('/admin');
      await this.page.waitForLoadState('networkidle');
      
      const currentUrl = this.page.url();
      return !currentUrl.includes('/signin');
    } catch (error) {
      return false;
    }
  }

  /**
   * Test auth endpoint directly (for smoke testing)
   */
  async testAuthEndpoint(credentials?: AuthCredentials): Promise<boolean> {
    const creds = credentials || this.getDefaultCredentials();
    
    try {
      const response = await this.page.request.post('/api/test/auth-check', {
        data: {
          email: creds.email,
          password: creds.password
        },
        headers: {
          'E2E-Test-Mode': 'true'
        }
      });

      if (response.ok()) {
        const result = await response.json();
        return result.ok === true;
      }
      
      return false;
    } catch (error) {
      console.error('Auth endpoint test error:', error);
      return false;
    }
  }

  /**
   * Ensure fresh context for each test
   */
  static async ensureFreshContext(page: Page): Promise<AuthHelper> {
    const helper = new AuthHelper(page);
    await helper.clearSession();
    return helper;
  }
}

/**
 * Convenience function for test setup
 */
export async function setupAuthTest(page: Page): Promise<AuthHelper> {
  return AuthHelper.ensureFreshContext(page);
}
