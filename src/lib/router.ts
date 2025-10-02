import { writable } from 'svelte/store'

export interface Route {
  path: string
  params: Record<string, string>
}

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/'
  
  // Match /note/:id pattern
  const noteMatch = hash.match(/^\/note\/(\d+)$/)
  if (noteMatch) {
    return {
      path: '/note/:id',
      params: { id: noteMatch[1] }
    }
  }
  
  return {
    path: hash,
    params: {}
  }
}

function createRouter() {
  const { subscribe, set } = writable<Route>(parseHash())
  
  function updateRoute() {
    set(parseHash())
  }
  
  // Listen to hash changes
  window.addEventListener('hashchange', updateRoute)
  
  return {
    subscribe,
    navigate: (path: string) => {
      window.location.hash = path
    }
  }
}

export const router = createRouter()
