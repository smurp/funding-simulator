<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { 
    simId, companyName, founders, events, exit, 
    loadedData, getDataFromString, toURL, generateId, resetData
  } from '$lib/store';
  import Homepage from '$lib/sections/Homepage.svelte';
  
  // Don't import simulation components until needed
  let Founders, SelectFunding, Exit, Results;
  
  // Props for embedding in other apps
  export let initialData: string | null = null;
  export let onStateChange: ((state: string) => void) | null = null;
  
  let unsubscribers: (() => void)[] = [];
  let theme = 'dark';
  let mounted = false;
  let componentsLoaded = false;
  
  // CRITICAL: Only show simulation if we have actual data
  $: hasValidData = $founders && $founders.length > 0;
  
  // Load simulation components when needed
  $: if (hasValidData && !componentsLoaded) {
    loadSimulationComponents();
  }
  
  async function loadSimulationComponents() {
    const [foundersModule, selectFundingModule, exitModule, resultsModule] = await Promise.all([
      import('$lib/sections/Founders.svelte'),
      import('$lib/sections/SelectFunding.svelte'),
      import('$lib/sections/Exit.svelte'),
      import('$lib/sections/Results.svelte')
    ]);
    
    Founders = foundersModule.default;
    SelectFunding = selectFundingModule.default;
    Exit = exitModule.default;
    Results = resultsModule.default;
    componentsLoaded = true;
  }
  
  onMount(() => {
    // Set theme
    if (browser) {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      theme = savedTheme;
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    // Load initial data if provided
    if (initialData) {
      try {
        const parsed = getDataFromString(initialData);
        $simId = parsed.id;
        $companyName = parsed.name;
        $founders = parsed.founders;
        $events = parsed.events;
        $exit = parsed.exit;
        $loadedData = true;
      } catch (e) {
        console.error('Failed to parse initial data:', e);
        resetData();
        $simId = generateId();
        $loadedData = false;
      }
    }
    
    // Set up state change notifications for parent
    if (onStateChange) {
      let timeout;
      const debouncedNotify = () => {
        clearTimeout(timeout);
        timeout = setTimeout(notifyParent, 300);
      };
      
      unsubscribers = [
        simId.subscribe(debouncedNotify),
        companyName.subscribe(debouncedNotify),
        founders.subscribe(debouncedNotify),
        events.subscribe(debouncedNotify),
        exit.subscribe(debouncedNotify)
      ];
    }
    
    mounted = true;
    
    return () => {
      unsubscribers.forEach(fn => fn());
    };
  });
  
  function notifyParent() {
    if (onStateChange && mounted && hasValidData) {
      try {
        const state = toURL();
        onStateChange(state);
      } catch (e) {
        console.error('Failed to notify parent of state change:', e);
      }
    }
  }
</script>

{#if mounted}
  <div class="funding-simulator-root" data-theme={theme}>
    {#if hasValidData && componentsLoaded}
      <div class="simulation-view">
        <svelte:component this={Founders} />
        <svelte:component this={SelectFunding} />
        <svelte:component this={Exit} />
        <svelte:component this={Results} />
      </div>
    {:else}
      <Homepage />
    {/if}
  </div>
{/if}

<style>
  .funding-simulator-root {
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: var(--bg, #fff);
    color: var(--text, #000);
  }
  
  .simulation-view {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .funding-simulator-root :global(*) {
    box-sizing: border-box;
  }
</style>