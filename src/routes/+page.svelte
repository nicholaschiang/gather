<script lang="ts">
  import { enhance } from "$app/forms"
  import { Button } from "$lib/components/ui/button"
  import { ShinyText } from "$lib/components/ui/shiny-text"

  let { data } = $props()
</script>

<main class="mx-auto max-w-xl space-y-4 p-4">
  <header class="flex justify-between">
    <ShinyText class="text-2xl font-black">G</ShinyText>
    <form method="post" action="?/logout" use:enhance>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        class="text-neutral-400 dark:text-neutral-600">Sign out</Button
      >
    </form>
  </header>

  <div class="space-y-2">
    <h1 class="font-semibold">It's time to gather, {data.user.givenName}</h1>
    <p class="text-sm text-neutral-400 dark:text-neutral-600">
      Solutions like Calendly help find 1-1 meeting times. <strong
        class="font-black italic">Gather</strong
      > helps find group meeting times (3+ people).
    </p>
  </div>

  {#await data.gatherings}
    <p>Loading gatherings...</p>
  {:then gatherings}
    {#each gatherings as gathering}
      <a
        class="relative flex flex-col overflow-hidden rounded border p-4"
        href="/g/{gathering.id}"
      >
        <span class="bg-primary/20 absolute inset-y-0 left-0 w-1"></span>
        <span class="font-medium">{gathering.title}</span>
        {#if gathering.description}<span
            class="text-sm text-neutral-400 dark:text-neutral-600"
            >{gathering.description}</span
          >{/if}
      </a>
    {/each}
  {:catch error}
    <p>Error loading gatherings: {error.message}</p>
  {/await}

  <div>
    <Button href="/new">New</Button>
  </div>
</main>
