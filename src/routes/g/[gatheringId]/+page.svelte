<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { X } from "@lucide/svelte"

  let { data } = $props()
</script>

<header
  class="bg-background sticky top-0 flex items-center justify-between px-4 pt-4"
>
  <h2 class="text-sm font-medium text-neutral-400 dark:text-neutral-600">
    Gathering
  </h2>
  <Button variant="secondary" href="/" size="icon" class="size-7 rounded-full"
    ><X /></Button
  >
</header>
<main class="space-y-4 p-4">
  {#await data.gathering}
    <p>Loading gathering...</p>
  {:then gathering}
    <h1 class="text-xl">{gathering.title}</h1>
    <hr class="-mr-4" />
    <p>{gathering.description}</p>
  {:catch error}
    <p>Error loading gathering: {error.message}</p>
  {/await}
</main>
