<script lang="ts">
  import { enhance } from "$app/forms"
  import { Button } from "$lib/components/ui/button"
  import { ShinyText } from "$lib/components/ui/shiny-text"
  import * as Avatar from "$lib/components/ui/avatar"
  import { cn } from "$lib/utils"
  import { QrCode } from "@lucide/svelte"

  let { data } = $props()
  let filter = $state<"all" | "created">("all")
  let all = $derived(data.gatherings)
  let created = $derived(
    data.gatherings.filter((g) => g.creatorId === data.user.id),
  )
  let gatherings = $derived(filter === "all" ? all : created)
</script>

<main class="mx-auto max-w-xl p-4">
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

  <div class="space-y-4">
    <div class="flex flex-col items-center justify-center space-y-2">
      <a class="relative" href="/qr">
        <Avatar.Root class="size-20">
          <Avatar.Image src={data.user.picture} alt={data.user.name} />
          <Avatar.Fallback class="text-sm">{data.user.name[0]}</Avatar.Fallback>
        </Avatar.Root>
        <div
          class="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border bg-neutral-100 dark:bg-neutral-800"
        >
          <QrCode class="size-5" />
        </div>
      </a>
      <div class="text-center">
        <h1>{data.user.name}</h1>
        <h2 class="text-xs text-neutral-500">{data.user.email}</h2>
      </div>
    </div>
    <div class="flex w-full space-x-2">
      <Button class="w-0 grow" variant="outline" href="/profile"
        >Edit profile</Button
      >
      <Button class="w-0 grow" variant="outline" href="/qr"
        >Share profile</Button
      >
    </div>
  </div>

  <div class="mt-8 space-y-4">
    <div>
      <h2 class="text-sm font-medium">Your friends</h2>
      <p class="text-xs text-neutral-500">
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

    <Button href="/new/friend" size="sm">Add friend</Button>
  </div>

  <div class="mt-12 space-y-4">
    <div>
      <h2 class="text-sm font-medium">Your gatherings</h2>
      <p class="text-xs text-neutral-500">Your upcoming and past gatherings.</p>
    </div>
    {#snippet filterButton(
      value: "all" | "created",
      count: number,
      label: string,
    )}
      <Button
        variant="outline"
        class={cn(
          "rounded-full text-xs",
          filter === value && "!bg-input/90 !border-primary",
        )}
        size="sm"
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
            <span class="text-xs text-neutral-400 dark:text-neutral-600"
              >Created by</span
            >
            <div class="flex items-center space-x-1.5">
              <Avatar.Root class="size-5">
                <Avatar.Image
                  src={gathering.creatorPicture}
                  alt={gathering.creatorName}
                />
                <Avatar.Fallback class="text-xs"
                  >{gathering.creatorName[0]}</Avatar.Fallback
                >
              </Avatar.Root>
              <span class="truncate text-xs">{gathering.creatorName}</span>
            </div>
          </div>
        </div>
      </a>
    {/each}

    <Button href="/new" size="sm">New</Button>
  </div>
</main>
