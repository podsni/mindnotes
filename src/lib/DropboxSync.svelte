<script lang="ts">
  import { dropboxService } from './dropbox';
  import { notesStore } from './store.svelte';

  // State
  let isSignedIn = $state(false);
  let userEmail = $state<string | null>(null);
  let isInitializing = $state(true);
  let isBackingUp = $state(false);
  let isRestoring = $state(false);
  let statusMessage = $state<string | null>(null);
  let statusType = $state<'success' | 'error' | 'info'>('info');
  let lastBackupTime = $state<string | null>(null);
  let hasAppKey = $state(false);

  // Check auth status and reconnect on mount
  $effect(() => {
    checkAuthStatus();
  });

  async function checkAuthStatus() {
    isInitializing = true;
    hasAppKey = dropboxService.hasAppKey;

    if (!hasAppKey) {
      isInitializing = false;
      return;
    }

    // Try to reconnect with stored token
    const reconnected = await dropboxService.reconnect();
    
    isSignedIn = dropboxService.isSignedIn;
    userEmail = dropboxService.userEmail;
    isInitializing = false;

    if (reconnected) {
      checkBackupMetadata();
    }
  }

  async function checkBackupMetadata() {
    try {
      const metadata = await dropboxService.getBackupMetadata();
      if (metadata) {
        const date = new Date(metadata.modified);
        lastBackupTime = date.toLocaleString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch (error) {
      console.error('Failed to get backup metadata:', error);
    }
  }

  function handleSignIn() {
    try {
      dropboxService.signIn();
      
      // Poll for sign in status
      const checkInterval = setInterval(() => {
        if (dropboxService.isSignedIn) {
          isSignedIn = true;
          userEmail = dropboxService.userEmail;
          clearInterval(checkInterval);
          showStatus('Berhasil login ke Dropbox!', 'success');
          checkBackupMetadata();
        }
      }, 1000);

      // Stop checking after 5 minutes
      setTimeout(() => clearInterval(checkInterval), 300000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal login ke Dropbox';
      showStatus(message, 'error');
    }
  }

  async function handleSignOut() {
    const confirmed = confirm('Yakin ingin logout dari Dropbox?');
    if (!confirmed) return;

    try {
      await dropboxService.signOut();
      isSignedIn = false;
      userEmail = null;
      lastBackupTime = null;
      showStatus('Berhasil logout dari Dropbox', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal logout';
      showStatus(message, 'error');
    }
  }

  async function handleBackup() {
    isBackingUp = true;
    statusMessage = null;

    try {
      const notes = await notesStore.getAllFullNotes();
      await dropboxService.backupToDropbox(notes);
      
      showStatus(`Berhasil backup ${notes.length} notes ke Dropbox!`, 'success');
      checkBackupMetadata();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal backup ke Dropbox';
      showStatus(message, 'error');
    } finally {
      isBackingUp = false;
    }
  }

  async function handleRestore() {
    const confirmed = confirm(
      'Restore akan mengganti semua notes yang ada dengan backup dari Dropbox. Lanjutkan?'
    );
    if (!confirmed) return;

    isRestoring = true;
    statusMessage = null;

    try {
      const notes = await dropboxService.restoreFromDropbox();
      await notesStore.importNotes(notes, 'replace');
      
      showStatus(`Berhasil restore ${notes.length} notes dari Dropbox!`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal restore dari Dropbox';
      showStatus(message, 'error');
    } finally {
      isRestoring = false;
    }
  }

  function showStatus(message: string, type: 'success' | 'error' | 'info') {
    statusMessage = message;
    statusType = type;

    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusMessage = null;
    }, 5000);
  }
</script>

<div class="dropbox-sync">
  <div class="section-header">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M6 2L0 6l6 4 6-4-6-4zM0 16l6 4 6-4-6-4-6 4zm12-6l6 4 6-4-6-4-6 4zm6 10l-6-4-6 4 6 4 6-4z" />
    </svg>
    <h3>Dropbox Sync</h3>
  </div>

  {#if !hasAppKey}
    <div class="warning-box">
      <p>⚠️ Dropbox App Key tidak dikonfigurasi.</p>
      <p class="help-text">
        Tambahkan <code>VITE_DROPBOX_APP_KEY</code> di file <code>.env.local</code>
      </p>
    </div>
  {:else if isInitializing}
    <div class="loading">
      <div class="spinner"></div>
      <p>Memeriksa koneksi Dropbox...</p>
    </div>
  {:else if !isSignedIn}
    <div class="sign-in-section">
      <p class="description">
        Backup dan sync notes Anda dengan Dropbox
      </p>
      <button class="btn-primary" onclick={handleSignIn}>
        <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 2L0 6l6 4 6-4-6-4zM0 16l6 4 6-4-6-4-6 4zm12-6l6 4 6-4-6-4-6 4zm6 10l-6-4-6 4 6 4 6-4z" />
        </svg>
        Sign in with Dropbox
      </button>
    </div>
  {:else}
    <div class="signed-in-section">
      <!-- User Info -->
      <div class="user-info">
        <div class="user-details">
          <div class="user-email">👤 {userEmail}</div>
          <div class="connection-status">✓ Connected to Dropbox</div>
        </div>
        <button class="btn-logout" onclick={handleSignOut} title="Logout dari Dropbox">
          <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Logout
        </button>
      </div>

      <!-- Backup Info -->
      {#if lastBackupTime}
        <div class="backup-info">
          <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <path d="M12 6v6l4 2" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>Backup terakhir: {lastBackupTime}</span>
        </div>
      {/if}

      <!-- Actions -->
      <div class="actions">
        <button
          class="btn-action btn-backup"
          onclick={handleBackup}
          disabled={isBackingUp || isRestoring}
        >
          {#if isBackingUp}
            <div class="spinner-small"></div>
            Backing up...
          {:else}
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5-5 5 5M12 5v12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Backup to Dropbox
          {/if}
        </button>

        <button
          class="btn-action btn-restore"
          onclick={handleRestore}
          disabled={isBackingUp || isRestoring}
        >
          {#if isRestoring}
            <div class="spinner-small"></div>
            Restoring...
          {:else}
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Restore from Dropbox
          {/if}
        </button>
      </div>

      <!-- Status Message -->
      {#if statusMessage}
        <div class="status-message {statusType}">
          {statusMessage}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .dropbox-sync {
    padding: 1rem;
    border-radius: 8px;
    background: var(--bg-secondary);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .section-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .icon {
    width: 24px;
    height: 24px;
    color: #0061ff;
  }

  .warning-box {
    padding: 1rem;
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 6px;
    color: #856404;
  }

  .warning-box p {
    margin: 0.5rem 0;
  }

  .warning-box code {
    background: rgba(0, 0, 0, 0.1);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }

  .help-text {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .loading {
    text-align: center;
    padding: 2rem 1rem;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 97, 255, 0.1);
    border-top-color: #0061ff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 1rem;
  }

  .sign-in-section {
    text-align: center;
    padding: 1rem 0;
  }

  .description {
    margin: 0 0 1.5rem 0;
    color: var(--text-secondary);
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: #0061ff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-primary:hover {
    background: #0052d9;
  }

  .btn-icon {
    width: 20px;
    height: 20px;
  }

  .signed-in-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .user-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: var(--bg-primary);
    border-radius: 6px;
    border: 1px solid var(--border-color);
  }

  .user-details {
    flex: 1;
  }

  .user-email {
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .connection-status {
    font-size: 0.85rem;
    color: #22c55e;
  }

  .btn-logout {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-logout:hover {
    background: #dc2626;
  }

  .icon-small {
    width: 16px;
    height: 16px;
  }

  .backup-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .btn-action {
    flex: 1;
    min-width: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-backup {
    background: #0061ff;
    color: white;
  }

  .btn-backup:hover:not(:disabled) {
    background: #0052d9;
  }

  .btn-restore {
    background: #22c55e;
    color: white;
  }

  .btn-restore:hover:not(:disabled) {
    background: #16a34a;
  }

  .btn-action:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  .status-message {
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.9rem;
    animation: slideIn 0.3s ease-out;
  }

  .status-message.success {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #22c55e;
  }

  .status-message.error {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #ef4444;
  }

  .status-message.info {
    background: #dbeafe;
    color: #1e40af;
    border: 1px solid #3b82f6;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .actions {
      flex-direction: column;
    }

    .btn-action {
      width: 100%;
    }

    .user-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .btn-logout {
      width: 100%;
      justify-content: center;
    }
  }
</style>
