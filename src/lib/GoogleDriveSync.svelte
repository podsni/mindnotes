<script lang="ts">
  import { googleDriveService } from './googleDrive'
  import { notesStore } from './store.svelte'

  let isSignedIn = $state(false)
  let userEmail = $state<string | null>(null)
  let isLoading = $state(false)
  let isInitializing = $state(true)
  let statusMessage = $state<string>('')
  let statusType = $state<'success' | 'error' | 'info'>('info')
  let syncMetadata = $state<any>(null)

  // Initialize and check auth status (with auto-reconnect)
  $effect(() => {
    const checkAuthStatus = async () => {
      try {
        isInitializing = true
        await googleDriveService.initialize()
        
        // Update state from service
        isSignedIn = googleDriveService.isUserSignedIn()
        userEmail = googleDriveService.getUserEmail()
        syncMetadata = googleDriveService.getSyncStatus()
        
        // Auto-reconnect if token exists
        if (isSignedIn && !userEmail) {
          console.log('Auto-reconnecting with stored token...')
          await googleDriveService.reconnect()
          isSignedIn = googleDriveService.isUserSignedIn()
          userEmail = googleDriveService.getUserEmail()
          
          if (isSignedIn && userEmail) {
            showStatus('Automatically signed in with saved credentials', 'success')
          }
        }
      } catch (error) {
        console.error('Failed to initialize Google Drive:', error)
        showStatus('Failed to initialize Google Drive', 'error')
      } finally {
        isInitializing = false
      }
    }
    checkAuthStatus()
  })

  const handleSignIn = async () => {
    isLoading = true
    statusMessage = ''
    
    try {
      await googleDriveService.signIn()
      isSignedIn = googleDriveService.isUserSignedIn()
      userEmail = googleDriveService.getUserEmail()
      
      showStatus('Successfully signed in to Google Drive!', 'success')
    } catch (error) {
      showStatus('Failed to sign in. Please try again.', 'error')
      console.error('Sign in error:', error)
    } finally {
      isLoading = false
    }
  }

  const handleSignOut = async () => {
    const confirmed = confirm('Are you sure you want to sign out from Google Drive?')
    if (!confirmed) return
    
    isLoading = true
    try {
      await googleDriveService.signOut()
      isSignedIn = false
      userEmail = null
      syncMetadata = googleDriveService.getSyncStatus()
      showStatus('Successfully signed out from Google Drive', 'success')
    } catch (error) {
      showStatus('Failed to sign out', 'error')
      console.error('Sign out error:', error)
    } finally {
      isLoading = false
    }
  }

  const handleBackup = async () => {
    if (!isSignedIn) {
      showStatus('Please sign in first', 'error')
      return
    }

    isLoading = true
    statusMessage = ''

    try {
      const notes = notesStore.notes
      await googleDriveService.backupToGoogleDrive(notes)
      syncMetadata = googleDriveService.getSyncStatus()
      
      showStatus(`Successfully backed up ${notes.length} notes to Google Drive!`, 'success')
    } catch (error) {
      showStatus('Backup failed. Please try again.', 'error')
      console.error('Backup error:', error)
    } finally {
      isLoading = false
    }
  }

  const handleRestore = async () => {
    if (!isSignedIn) {
      showStatus('Please sign in first', 'error')
      return
    }

    const confirmed = confirm(
      'This will replace your current notes with the backup from Google Drive. Continue?'
    )
    
    if (!confirmed) return

    isLoading = true
    statusMessage = ''

    try {
      const restoredNotes = await googleDriveService.restoreFromGoogleDrive()
      
      // Import restored notes
      await notesStore.importNotes(restoredNotes, 'replace')
      syncMetadata = googleDriveService.getSyncStatus()
      
      showStatus(`Successfully restored ${restoredNotes.length} notes from Google Drive!`, 'success')
    } catch (error) {
      showStatus('Restore failed. Please try again.', 'error')
      console.error('Restore error:', error)
    } finally {
      isLoading = false
    }
  }

  const showStatus = (message: string, type: 'success' | 'error' | 'info') => {
    statusMessage = message
    statusType = type
    setTimeout(() => {
      statusMessage = ''
    }, 5000)
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleString()
  }
</script>

<div class="google-drive-sync">
  <div class="sync-header">
    <div class="sync-title">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
      <h3>Google Drive Sync</h3>
    </div>
    <p class="sync-description">
      Backup your notes to Google Drive and sync across devices
    </p>
  </div>

  {#if isInitializing}
    <div class="auth-section">
      <div class="loading-spinner">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" opacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" opacity="1">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 12 12"
              to="360 12 12"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
      <p class="auth-prompt">Checking authentication status...</p>
    </div>
  {:else if !isSignedIn}
    <div class="auth-section">
      <p class="auth-prompt">Sign in with your Google account to start backing up your notes</p>
      <button
        type="button"
        class="btn-google-signin"
        onclick={handleSignIn}
        disabled={isLoading}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </button>
    </div>
  {:else}
    <div class="signed-in-section">
      <div class="user-info-header">
        <div class="user-info">
          <div class="user-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div class="user-details">
            <p class="user-email">{userEmail || 'Signed in'}</p>
            <p class="user-status">✓ Connected to Google Drive</p>
          </div>
        </div>
        <button 
          type="button" 
          class="btn-logout" 
          onclick={handleSignOut}
          disabled={isLoading}
          title="Sign out from Google Drive"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>

      <div class="sync-actions">
        <button
          type="button"
          class="btn-sync backup"
          onclick={handleBackup}
          disabled={isLoading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {isLoading ? 'Backing up...' : 'Backup to Drive'}
        </button>

        <button
          type="button"
          class="btn-sync restore"
          onclick={handleRestore}
          disabled={isLoading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {isLoading ? 'Restoring...' : 'Restore from Drive'}
        </button>
      </div>

      {#if syncMetadata}
        <div class="sync-status">
          <div class="status-item">
            <span class="status-label">Last backup:</span>
            <span class="status-value">{formatDate(syncMetadata.lastBackupTime)}</span>
          </div>
          <div class="status-item">
            <span class="status-label">Last sync:</span>
            <span class="status-value">{formatDate(syncMetadata.lastSyncTime)}</span>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  {#if statusMessage}
    <div class="status-message" class:success={statusType === 'success'} class:error={statusType === 'error'} class:info={statusType === 'info'}>
      {#if statusType === 'success'}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      {:else if statusType === 'error'}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      {:else}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      {/if}
      {statusMessage}
    </div>
  {/if}
</div>

<style>
  .google-drive-sync {
    border-top: 1px solid var(--border-color, #e5e7eb);
    padding: 1.5rem 0;
  }

  .sync-header {
    margin-bottom: 1.5rem;
  }

  .sync-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .sync-title svg {
    color: var(--primary-color, #3b82f6);
  }

  .sync-title h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary, #111827);
  }

  .sync-description {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary, #6b7280);
  }

  .auth-section {
    text-align: center;
    padding: 2rem 1rem;
  }

  .loading-spinner {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
    color: var(--primary-color, #3b82f6);
  }

  .auth-prompt {
    margin-bottom: 1.5rem;
    color: var(--text-secondary, #6b7280);
    font-size: 0.875rem;
  }

  .btn-google-signin {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: white;
    border: 1px solid #dadce0;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #3c4043;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .btn-google-signin:hover:not(:disabled) {
    background: #f8f9fa;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .btn-google-signin:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .signed-in-section {
    padding: 0.5rem 0;
  }

  .user-info-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-secondary, #f9fafb);
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid var(--border-color, #e5e7eb);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }

  .user-avatar {
    width: 2.5rem;
    height: 2.5rem;
    background: var(--primary-color, #3b82f6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .user-details {
    flex: 1;
    min-width: 0;
  }

  .user-email {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary, #111827);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-status {
    margin: 0;
    font-size: 0.75rem;
    color: var(--success-color, #10b981);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .btn-logout {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--bg-primary, white);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--text-primary, #111827);
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .btn-logout:hover:not(:disabled) {
    background: var(--error-bg, #fef2f2);
    border-color: var(--error-color, #ef4444);
    color: var(--error-color, #ef4444);
  }

  .btn-logout:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .sync-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .btn-sync {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-sync.backup {
    background: var(--primary-color, #3b82f6);
    color: white;
    border-color: var(--primary-color, #3b82f6);
  }

  .btn-sync.backup:hover:not(:disabled) {
    background: var(--primary-hover, #2563eb);
  }

  .btn-sync.restore {
    background: white;
    color: var(--text-primary, #111827);
  }

  .btn-sync.restore:hover:not(:disabled) {
    background: var(--bg-secondary, #f9fafb);
  }

  .btn-sync:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .sync-status {
    padding: 1rem;
    background: var(--bg-secondary, #f9fafb);
    border-radius: 0.375rem;
    font-size: 0.75rem;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
  }

  .status-item:not(:last-child) {
    border-bottom: 1px solid var(--border-color, #e5e7eb);
  }

  .status-label {
    color: var(--text-secondary, #6b7280);
  }

  .status-value {
    font-weight: 500;
    color: var(--text-primary, #111827);
  }

  .status-message {
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: slideIn 0.3s ease;
  }

  .status-message.success {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #86efac;
  }

  .status-message.error {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
  }

  .status-message.info {
    background: #dbeafe;
    color: #1e40af;
    border: 1px solid #93c5fd;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    .sync-actions {
      grid-template-columns: 1fr;
    }
  }
</style>
