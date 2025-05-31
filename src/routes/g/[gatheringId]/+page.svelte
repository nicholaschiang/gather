<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Share, X } from "@lucide/svelte"
  import { toast } from "svelte-sonner"
  import copy from "copy-to-clipboard"

  let { data } = $props()

  function copyShareLink() {
    if (copy(window.location.href)) {
      toast("Copied link to clipboard!")
    } else {
      toast("Could not copy link to clipboard. Try again later.")
    }
  }
</script>

<header
  class="bg-background sticky top-0 flex items-center justify-between px-4 pt-4 lg:max-w-xl lg:mx-auto"
>
  <h2 class="text-sm font-medium text-neutral-400 dark:text-neutral-600">
    Gathering
  </h2>
  <div class="flex items-center gap-2">
    <Button
      variant="ghost"
      onclick={copyShareLink}
      size="icon"
      class="size-7 rounded-full"
    >
      <Share />
    </Button>
    <Button variant="secondary" href="/" size="icon" class="size-7 rounded-full"
      ><X /></Button
    >
  </div>
</header>
<main class="space-y-4 p-4 lg:max-w-xl lg:mx-auto">
  {#await data.gathering}
    <p>Loading gathering...</p>
  {:then gathering}
    <h1 class="text-xl">{gathering.title}</h1>
    <hr class="-mr-4 lg:mr-0" />
    <p>{gathering.description}</p>
  {:catch error}
    <p>Error loading gathering: {error.message}</p>
  {/await}
</main>
