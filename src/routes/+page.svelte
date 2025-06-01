<script lang="ts">
  import { enhance } from "$app/forms"
  import { Button } from "$lib/components/ui/button"
  import { ShinyText } from "$lib/components/ui/shiny-text"
  import * as Avatar from "$lib/components/ui/avatar"
  import { cn } from "$lib/utils"

  let { data } = $props()
  let filter = $state<"all" | "created">("all")
  let all = data.gatherings
  let created = data.gatherings.filter((g) => g.creatorId === data.user.id)
  let gatherings = $derived(filter === "all" ? all : created)

  $inspect(filter)
  $inspect(gatherings)
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

  {#snippet filterButton(
    value: "all" | "created",
    count: number,
    label: string,
  )}
    <Button
      variant="outline"
      class={cn(
        "rounded-full",
        filter === value && "!bg-input/90 !border-primary",
      )}
      onclick={() => (filter = value)}
      >{label}<span class="opacity-50">{count}</span></Button
    >
  {/snippet}

  <div class="flex items-center gap-2 mt-8">
    {@render filterButton("all", all.length, "All")}
    {@render filterButton("created", created.length, "Created by me")}
  </div>

  {#each gatherings as gathering}
    <a
      class="relative flex flex-col gap-2 overflow-hidden rounded border p-4"
      href="/g/{gathering.id}"
    >
      <span class="bg-primary/20 absolute inset-y-0 left-0 w-1"></span>
      <span class="font-medium">{gathering.title}</span>
      {#if gathering.description}<span
          class="line-clamp-2 text-sm text-neutral-400 dark:text-neutral-600"
          >{gathering.description}</span
        >{/if}
      <div class="flex items-center space-x-2">
        <span class="text-sm text-neutral-400 dark:text-neutral-600"
          >Created by</span
        >
        <div class="flex items-center space-x-1.5">
          <Avatar.Root class="size-6">
            <Avatar.Image
              src={gathering.creatorPicture}
              alt={gathering.creatorName}
            />
            <Avatar.Fallback class="text-xs"
              >{gathering.creatorName[0]}</Avatar.Fallback
            >
          </Avatar.Root>
          <span class="text-sm">{gathering.creatorName}</span>
        </div>
      </div>
    </a>
  {/each}

  <div>
    <Button href="/new">New</Button>
  </div>
</main>
