<script lang="ts">
  let isOnline = $state(navigator.onLine)
  let showIndicator = $state(!navigator.onLine)

  const handleOnline = () => {
    isOnline = true
    showIndicator = true
    // Hide "Back Online" message after 3 seconds
    setTimeout(() => {
      showIndicator = false
    }, 3000)
  }

  const handleOffline = () => {
    isOnline = false
    showIndicator = true
  }

  $effect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  })
</script>

{#if showIndicator}
  <div class="offline-indicator" class:online={isOnline} class:offline={!isOnline}>
    <div class="indicator-content">
      {#if isOnline}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
        <span>Back Online</span>
      {:else}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
        <span>Offline Mode</span>
      {/if}
    </div>
  </div>
{/if}

<style>
  .offline-indicator {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 9999;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    font-size: 0.875rem;
    font-weight: 500;
    animation: slideIn 0.3s ease;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .offline-indicator.offline {
    background: rgba(230, 126, 128, 0.9);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .offline-indicator.online {
    background: rgba(167, 192, 128, 0.9);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .indicator-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .indicator-content svg {
    flex-shrink: 0;
  }

  @keyframes slideIn {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .offline-indicator {
      bottom: 0.75rem;
      right: 0.75rem;
      left: 0.75rem;
      text-align: center;
      justify-content: center;
    }
  }
</style>
