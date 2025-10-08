/**
 * Dropbox API Service for MindNote
 * Handles authentication, backup, and restore operations
 */

import type { Note } from './db';

interface DropboxAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  account_id: string;
  uid: string;
}

interface DropboxUserInfo {
  email: string;
  name: {
    display_name: string;
  };
}

class DropboxService {
  private _accessToken: string | null = null;
  private _userEmail: string | null = null;
  private _isSignedIn: boolean = false;
  private readonly STORAGE_KEY = 'mindnote_dropbox_auth';
  private readonly APP_KEY = import.meta.env.VITE_DROPBOX_APP_KEY || '';
  private readonly REDIRECT_URI = window.location.origin + '/dropbox-callback';
  private readonly BACKUP_FILENAME = '/mindnote_backup.json';

  constructor() {
    // Check for stored token on initialization
    this.loadStoredToken();
  }

  /**
   * Load stored access token from localStorage
   */
  private loadStoredToken(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this._accessToken = data.access_token;
        this._userEmail = data.email;
        this._isSignedIn = true;
      }
    } catch (error) {
      console.error('Failed to load stored Dropbox token:', error);
      this.clearStoredToken();
    }
  }

  /**
   * Save access token to localStorage
   */
  private saveToken(token: string, email: string): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          access_token: token,
          email: email,
          timestamp: Date.now(),
        })
      );
      this._accessToken = token;
      this._userEmail = email;
      this._isSignedIn = true;
    } catch (error) {
      console.error('Failed to save Dropbox token:', error);
    }
  }

  /**
   * Clear stored token
   */
  private clearStoredToken(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this._accessToken = null;
    this._userEmail = null;
    this._isSignedIn = false;
  }

  /**
   * Get user info from Dropbox API
   */
  private async getUserInfo(): Promise<DropboxUserInfo> {
    if (!this._accessToken) {
      throw new Error('Not authenticated');
    }

    // RPC endpoint - no body required when no parameters
    const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this._accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dropbox API error:', response.status, errorText);
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  /**
   * Reconnect using stored token
   */
  async reconnect(): Promise<boolean> {
    if (!this._accessToken) {
      return false;
    }

    try {
      // Verify token by getting user info
      const userInfo = await this.getUserInfo();
      this._userEmail = userInfo.email;
      this._isSignedIn = true;
      return true;
    } catch (error) {
      console.error('Dropbox reconnect failed:', error);
      this.clearStoredToken();
      return false;
    }
  }

  /**
   * Start OAuth flow
   */
  signIn(): void {
    if (!this.APP_KEY) {
      throw new Error('Dropbox App Key not configured. Please set VITE_DROPBOX_APP_KEY in .env.local');
    }

    // Generate random state for CSRF protection
    const state = Math.random().toString(36).substring(7);
    sessionStorage.setItem('dropbox_auth_state', state);

    // Build OAuth URL
    const authUrl = new URL('https://www.dropbox.com/oauth2/authorize');
    authUrl.searchParams.set('client_id', this.APP_KEY);
    authUrl.searchParams.set('redirect_uri', this.REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('state', state);

    // Open in popup window
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authUrl.toString(),
      'Dropbox Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Listen for auth callback
    this.listenForAuthCallback(popup);
  }

  /**
   * Listen for OAuth callback via postMessage
   */
  private listenForAuthCallback(popup: Window | null): void {
    // Listen for postMessage from callback page
    const messageHandler = async (event: MessageEvent) => {
      // Verify origin
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'dropbox-auth-success') {
        try {
          const { accessToken, state } = event.data;

          // Verify state
          const savedState = sessionStorage.getItem('dropbox_auth_state');
          sessionStorage.removeItem('dropbox_auth_state');

          if (state !== savedState) {
            throw new Error('State mismatch - possible CSRF attack');
          }

          if (accessToken) {
            this._accessToken = accessToken;
            
            // Get user info
            const userInfo = await this.getUserInfo();
            this.saveToken(accessToken, userInfo.email);
            
            popup?.close();
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          popup?.close();
        } finally {
          window.removeEventListener('message', messageHandler);
        }
      } else if (event.data.type === 'dropbox-auth-error') {
        console.error('Dropbox auth error:', event.data.error);
        popup?.close();
        window.removeEventListener('message', messageHandler);
      }
    };

    window.addEventListener('message', messageHandler);

    // Also check if popup closes without auth
    const checkClosed = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
      }
    }, 1000);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(checkClosed);
      window.removeEventListener('message', messageHandler);
      popup?.close();
    }, 300000);
  }

  /**
   * Sign out and revoke access
   */
  async signOut(): Promise<void> {
    if (this._accessToken) {
      try {
        // Revoke token - RPC endpoint with no parameters
        await fetch('https://api.dropboxapi.com/2/auth/token/revoke', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this._accessToken}`,
          },
        });
      } catch (error) {
        console.error('Failed to revoke Dropbox token:', error);
      }
    }

    this.clearStoredToken();
  }

  /**
   * Upload backup to Dropbox
   */
  async backupToDropbox(notes: Note[]): Promise<void> {
    if (!this._accessToken) {
      throw new Error('Not signed in to Dropbox');
    }

    const backupData = {
      notes: notes,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };

    const content = JSON.stringify(backupData, null, 2);

    // Upload file (will overwrite if exists)
    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this._accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: this.BACKUP_FILENAME,
          mode: 'overwrite',
          autorename: false,
          mute: false,
        }),
      },
      body: content,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Dropbox upload failed: ${error.error_summary || 'Unknown error'}`);
    }
  }

  /**
   * Download backup from Dropbox
   */
  async restoreFromDropbox(): Promise<Note[]> {
    if (!this._accessToken) {
      throw new Error('Not signed in to Dropbox');
    }

    // Download file
    const response = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this._accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({
          path: this.BACKUP_FILENAME,
        }),
      },
    });

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('No backup found in Dropbox');
      }
      const error = await response.json();
      throw new Error(`Dropbox download failed: ${error.error_summary || 'Unknown error'}`);
    }

    const text = await response.text();
    const data = JSON.parse(text);

    if (!data.notes || !Array.isArray(data.notes)) {
      throw new Error('Invalid backup file format');
    }

    return data.notes;
  }

  /**
   * Check if backup file exists
   */
  async hasBackupFile(): Promise<boolean> {
    if (!this._accessToken) {
      return false;
    }

    try {
      const response = await fetch('https://api.dropboxapi.com/2/files/get_metadata', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: this.BACKUP_FILENAME,
        }),
      });

      // 409 means file not found - this is expected on first use
      if (response.status === 409) {
        return false;
      }

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get backup file metadata
   */
  async getBackupMetadata(): Promise<{ modified: string; size: number } | null> {
    if (!this._accessToken) {
      return null;
    }

    try {
      const response = await fetch('https://api.dropboxapi.com/2/files/get_metadata', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: this.BACKUP_FILENAME,
        }),
      });

      // 409 means file not found - return null instead of throwing
      if (response.status === 409) {
        return null;
      }

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        modified: data.server_modified,
        size: data.size,
      };
    } catch (error) {
      return null;
    }
  }

  // Getters
  get isSignedIn(): boolean {
    return this._isSignedIn;
  }

  get userEmail(): string | null {
    return this._userEmail;
  }

  get hasAppKey(): boolean {
    return this.APP_KEY.length > 0;
  }
}

// Export singleton instance
export const dropboxService = new DropboxService();
