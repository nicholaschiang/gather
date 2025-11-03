<script lang="ts">
  import { enhance } from "$app/forms"
  import { Button } from "$lib/components/ui/button"
  import { ShinyText } from "$lib/components/ui/shiny-text"
  import * as Avatar from "$lib/components/ui/avatar"
  import { cn } from "$lib/utils"

  let { data } = $props()
  let filter = $state<"all" | "created">("all")
  let all = $derived(data.gatherings)
  let created = $derived(
    data.gatherings.filter((g) => g.creatorId === data.user.id),
  )
  let gatherings = $derived(filter === "all" ? all : created)
</script>

<main class="mx-auto max-w-xl space-y-8 p-4">
  <div class="space-y-2">
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
    <h1>Welcome, {data.user.givenName}</h1>
  </div>

  <div class="space-y-4">
    <div>
      <h2 class="text-lg font-medium">Your friends</h2>
      <p class="text-sm text-neutral-500">
        Click on a friend to create a gathering with them.
      </p>
    </div>

    {#each data.friends as friend (friend.id)}
      <a
        class="flex items-center space-x-3 rounded-md border p-3"
        href="/new/gathering/{friend.id}"
      >
        <Avatar.Root>
          <Avatar.Image src={friend.picture} alt={friend.name} />
          <Avatar.Fallback class="text-sm">{friend.name[0]}</Avatar.Fallback>
        </Avatar.Root>
        <div>
          <h2 class="text-sm">{friend.name}</h2>
          <p class="text-xs text-neutral-500">{friend.email}</p>
        </div>
      </a>
    {/each}

    <Button href="/new/friend">Add friend</Button>
  </div>

  <div class="space-y-4">
    <div>
      <h2 class="text-lg font-medium">Your gatherings</h2>
      <p class="text-sm text-neutral-500">Your upcoming and past gatherings.</p>
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

    <div class="flex items-center gap-2">
      {@render filterButton("all", all.length, "All")}
      {@render filterButton("created", created.length, "Created by me")}
    </div>

    {#each gatherings as gathering (gathering.id)}
      <a
        class="relative flex overflow-hidden rounded-md border"
        href="/g/{gathering.id}"
      >
        <span class="relative w-1.5 flex-none self-stretch">
          <span class="bg-primary/5 absolute inset-y-0 -right-2 left-0 -z-1"
          ></span>
        </span>
        <div class="bg-background flex w-0 grow flex-col gap-2 rounded-md p-4">
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
              <span class="truncate text-sm">{gathering.creatorName}</span>
            </div>
          </div>
        </div>
      </a>
    {/each}

    <Button href="/new">New</Button>
  </div>
</main>
