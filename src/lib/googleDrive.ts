/**
 * Google Drive API Integration for MindNote
 * Handles authentication, backup, and sync with Google Drive
 */

interface GoogleAuthConfig {
  clientId: string
  apiKey: string
  scope: string
  discoveryDocs: string[]
}

interface SyncMetadata {
  lastSyncTime: number
  driveFileId: string | null
  lastBackupTime: number
}

const CONFIG: GoogleAuthConfig = {
  // Load from environment variables (set in .env.local)
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID.apps.googleusercontent.com',
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
  scope: 'https://www.googleapis.com/auth/drive.file',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
}

// Debug: Log config (remove in production)
if (import.meta.env.DEV) {
  console.log('Google Drive Config:', {
    clientId: CONFIG.clientId,
    hasApiKey: !!CONFIG.apiKey,
    scope: CONFIG.scope
  })
}

const STORAGE_KEY = 'mindnote_google_auth'
const SYNC_METADATA_KEY = 'mindnote_sync_metadata'
const BACKUP_FILENAME = 'mindnote_backup.json'

class GoogleDriveService {
  private isInitialized = false
  private _isSignedIn = false
  private _userEmail: string | null = null
  private tokenClient: any = null

  constructor() {
    this.loadAuthState()
  }

  /**
   * Initialize Google API client
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Load Google API script
      await this.loadScript('https://accounts.google.com/gsi/client')
      await this.loadScript('https://apis.google.com/js/api.js')

      // Initialize token client for OAuth
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.clientId,
        scope: CONFIG.scope,
        callback: (response: any) => {
          if (response.access_token) {
            this.handleAuthSuccess(response.access_token)
          }
        }
      })

      // Initialize Google API client
      await new Promise<void>((resolve) => {
        gapi.load('client', async () => {
          const initConfig: any = {
            discoveryDocs: CONFIG.discoveryDocs
          }
          // Add API key only if provided
          if (CONFIG.apiKey) {
            initConfig.apiKey = CONFIG.apiKey
          }
          await gapi.client.init(initConfig)
          resolve()
        })
      })

      this.isInitialized = true
      
      // Check if we have a valid token
      const token = this.getStoredToken()
      if (token) {
        gapi.client.setToken({ access_token: token })
        await this.verifyToken()
      }
    } catch (error) {
      console.error('Failed to initialize Google Drive:', error)
      throw new Error('Failed to initialize Google Drive API')
    }
  }

  /**
   * Reconnect using stored token (for auto-login after refresh)
   */
  async reconnect(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const token = this.getStoredToken()
    if (!token) {
      throw new Error('No stored token found')
    }

    try {
      gapi.client.setToken({ access_token: token })
      await this.verifyToken()
      console.log('Reconnected successfully with stored token')
    } catch (error) {
      console.error('Reconnection failed:', error)
      // Clear invalid token
      this.signOut()
      throw new Error('Session expired. Please sign in again.')
    }
  }

  /**
   * Load external script
   */
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load ${src}`))
      document.head.appendChild(script)
    })
  }

  /**
   * Sign in with Google
   */
  async signIn(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      this.tokenClient.requestAccessToken()
    } catch (error) {
      console.error('Sign in failed:', error)
      throw new Error('Failed to sign in with Google')
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    return new Promise((resolve) => {
      const token = gapi.client.getToken()
      if (token) {
        google.accounts.oauth2.revoke(token.access_token, () => {
          console.log('Token revoked from Google')
          resolve()
        })
        gapi.client.setToken(null)
      } else {
        resolve()
      }
      
      this._isSignedIn = false
      this._userEmail = null
      localStorage.removeItem(STORAGE_KEY)
    })
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(accessToken: string): void {
    gapi.client.setToken({ access_token: accessToken })
    localStorage.setItem(STORAGE_KEY, accessToken)
    this._isSignedIn = true
    this.getUserInfo()
  }

  /**
   * Get user info
   */
  private async getUserInfo(): Promise<void> {
    try {
      const response = await gapi.client.request({
        path: 'https://www.googleapis.com/oauth2/v1/userinfo',
        method: 'GET'
      })
      this._userEmail = response.result.email
    } catch (error) {
      console.error('Failed to get user info:', error)
    }
  }

  /**
   * Verify stored token is still valid
   */
  private async verifyToken(): Promise<void> {
    try {
      await this.getUserInfo()
      this._isSignedIn = true
    } catch (error) {
      console.error('Token verification failed:', error)
      this.signOut()
    }
  }

  /**
   * Get stored access token
   */
  private getStoredToken(): string | null {
    return localStorage.getItem(STORAGE_KEY)
  }

  /**
   * Load authentication state
   */
  private loadAuthState(): void {
    const token = this.getStoredToken()
    this._isSignedIn = !!token
  }

  /**
   * Get sync metadata
   */
  private getSyncMetadata(): SyncMetadata {
    const stored = localStorage.getItem(SYNC_METADATA_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    return {
      lastSyncTime: 0,
      driveFileId: null,
      lastBackupTime: 0
    }
  }

  /**
   * Save sync metadata
   */
  private saveSyncMetadata(metadata: SyncMetadata): void {
    localStorage.setItem(SYNC_METADATA_KEY, JSON.stringify(metadata))
  }

  /**
   * Backup notes to Google Drive
   */
  async backupToGoogleDrive(notes: any[]): Promise<void> {
    if (!this._isSignedIn) {
      throw new Error('Please sign in to Google Drive first')
    }

    try {
      const metadata = this.getSyncMetadata()
      const backupData = {
        version: 1,
        timestamp: Date.now(),
        notes: notes,
        metadata: {
          totalNotes: notes.length,
          exportedBy: 'MindNote'
        }
      }

      const content = JSON.stringify(backupData, null, 2)
      const blob = new Blob([content], { type: 'application/json' })

      if (metadata.driveFileId) {
        // Update existing file
        await this.updateFile(metadata.driveFileId, blob)
      } else {
        // Create new file
        const fileId = await this.createFile(BACKUP_FILENAME, blob)
        metadata.driveFileId = fileId
      }

      metadata.lastBackupTime = Date.now()
      this.saveSyncMetadata(metadata)
    } catch (error) {
      console.error('Backup failed:', error)
      throw new Error('Failed to backup to Google Drive')
    }
  }

  /**
   * Restore notes from Google Drive
   */
  async restoreFromGoogleDrive(): Promise<any[]> {
    if (!this._isSignedIn) {
      throw new Error('Please sign in to Google Drive first')
    }

    try {
      const metadata = this.getSyncMetadata()
      
      if (!metadata.driveFileId) {
        // Try to find existing backup file
        const fileId = await this.findBackupFile()
        if (fileId) {
          metadata.driveFileId = fileId
          this.saveSyncMetadata(metadata)
        } else {
          throw new Error('No backup found on Google Drive')
        }
      }

      const content = await this.downloadFile(metadata.driveFileId)
      const backupData = JSON.parse(content)

      metadata.lastSyncTime = Date.now()
      this.saveSyncMetadata(metadata)

      return backupData.notes || []
    } catch (error) {
      console.error('Restore failed:', error)
      throw new Error('Failed to restore from Google Drive')
    }
  }

  /**
   * Create a new file on Google Drive
   */
  private async createFile(filename: string, blob: Blob): Promise<string> {
    const metadata = {
      name: filename,
      mimeType: 'application/json'
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', blob)

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gapi.client.getToken().access_token}`
      },
      body: form
    })

    if (!response.ok) {
      throw new Error('Failed to create file')
    }

    const result = await response.json()
    return result.id
  }

  /**
   * Update an existing file on Google Drive
   */
  private async updateFile(fileId: string, blob: Blob): Promise<void> {
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${gapi.client.getToken().access_token}`,
        'Content-Type': 'application/json'
      },
      body: blob
    })

    if (!response.ok) {
      throw new Error('Failed to update file')
    }
  }

  /**
   * Download a file from Google Drive
   */
  private async downloadFile(fileId: string): Promise<string> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${gapi.client.getToken().access_token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to download file')
    }

    return await response.text()
  }

  /**
   * Find existing backup file
   */
  private async findBackupFile(): Promise<string | null> {
    try {
      const response = await gapi.client.drive.files.list({
        q: `name='${BACKUP_FILENAME}' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
        pageSize: 1
      })

      const files = response.result.files
      return files && files.length > 0 ? files[0].id : null
    } catch (error) {
      console.error('Failed to find backup file:', error)
      return null
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncMetadata {
    return this.getSyncMetadata()
  }

  /**
   * Check if signed in
   */
  isUserSignedIn(): boolean {
    return this._isSignedIn
  }

  /**
   * Get user email
   */
  getUserEmail(): string | null {
    return this._userEmail
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService()

// Type declarations for Google API
declare global {
  interface Window {
    gapi: any
    google: any
  }
  const gapi: any
  const google: any
}
