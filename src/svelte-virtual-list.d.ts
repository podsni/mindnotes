declare module 'svelte-virtual-list' {
  import { SvelteComponent } from 'svelte'
  
  export interface VirtualListProps {
    items: any[]
    height?: string
    itemHeight?: number
    start?: number
    end?: number
  }
  
  export default class VirtualList extends SvelteComponent<VirtualListProps> {}
}
