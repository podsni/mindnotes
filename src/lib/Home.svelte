<script lang="ts">
  import { notesStore } from './store.svelte'
  import { router } from './router'

  const handleNewNote = async () => {
    const id = await notesStore.createNote('New Note', '')
    router.navigate(`/note/${id}`)
  }
</script>

<div class="home">
  <div class="welcome">
    <div class="icon">📝</div>
    <h1>Welcome to MindNote</h1>
    <p>A fast, offline-first note-taking app</p>
    
    <button onclick={handleNewNote} class="btn-start">
      Create Your First Note
    </button>

    <div class="features">
      <div class="feature">
        <span class="feature-icon">⚡</span>
        <span>Lightning Fast</span>
      </div>
      <div class="feature">
        <span class="feature-icon">📱</span>
        <span>Offline Ready</span>
      </div>
      <div class="feature">
        <span class="feature-icon">🔒</span>
        <span>Local Storage</span>
      </div>
    </div>
  </div>
</div>

<style>
  .home {
    flex: 1;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1e1e1e;
  }

  .welcome {
    text-align: center;
    max-width: 500px;
    padding: 2rem;
  }

  .icon {
    font-size: 5rem;
    margin-bottom: 1rem;
  }

  .welcome h1 {
    font-size: 2.5rem;
    margin: 0 0 0.5rem 0;
    color: #fff;
  }

  .welcome p {
    font-size: 1.2rem;
    color: #aaa;
    margin: 0 0 2rem 0;
  }

  .btn-start {
    background: #007acc;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.2s;
    font-weight: 600;
  }

  .btn-start:hover {
    background: #005a9e;
  }

  .features {
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin-top: 3rem;
  }

  .feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: #888;
    font-size: 0.9rem;
  }

  .feature-icon {
    font-size: 2rem;
  }
</style>
