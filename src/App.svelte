<script lang="ts">
  import { onMount } from 'svelte'
  import Sidebar from './lib/Sidebar.svelte'
  import Editor from './lib/Editor.svelte'
  import Home from './lib/Home.svelte'
  import { notesStore } from './lib/store.svelte'
  import { router } from './lib/router'

  let currentRoute = $state({ path: '/', params: {} })

  // Subscribe to route changes
  router.subscribe(route => {
    currentRoute = route
  })

  // Load notes on app startup
  onMount(() => {
    notesStore.loadNotes()
  })
</script>

<div class="app">
  <Sidebar />
  <main class="main-content">
    {#if currentRoute.path === '/'}
      <Home />
    {:else if currentRoute.path === '/note/:id' && currentRoute.params.id}
      <Editor id={currentRoute.params.id} />
    {:else}
      <Home />
    {/if}
  </main>
</div>

<style>
  .app {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: #1e1e1e;
    color: #e0e0e0;
  }

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
</style>
