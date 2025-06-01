<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Google } from "$lib/components/icons/google"
  import { Clock, PartyPopper, Share, User, X } from "@lucide/svelte"
  import { toast } from "svelte-sonner"
  import copy from "copy-to-clipboard"
  import { enhance } from "$app/forms"
  import * as Avatar from "$lib/components/ui/avatar"
  import { type User as UserT } from "$lib/server/db/schema"

  let { data } = $props()
  let { user } = data
  let participantCount = data.attendees.length + 1

  function copyShareLink() {
    if (copy(window.location.href)) {
      toast("Copied link to clipboard!")
    } else {
      toast("Could not copy link to clipboard. Try again later.")
    }
  }
</script>

<header
  class="bg-background sticky top-0 flex items-center justify-between px-4 pt-4 lg:mx-auto lg:max-w-xl"
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
<main class="space-y-4 p-4 lg:mx-auto lg:max-w-xl">
  <h1 class="text-xl">{data.gathering.title}</h1>

  <hr class="-mr-4 lg:mr-0" />
  <div class="flex space-x-4">
    <Clock class="mt-1 size-4 text-neutral-400 dark:text-neutral-600" />
    <div>Time has not been set yet.</div>
  </div>

  <hr class="-mr-4 lg:mr-0" />
  <div class="flex space-x-4">
    <User class="mt-1 size-4 text-neutral-400 dark:text-neutral-600" />
    <div class="space-y-4">
      <p>
        {participantCount} participant{#if participantCount !== 1}s{/if}
      </p>

      {#snippet person(user: UserT, label?: string)}
        <li class="flex items-center space-x-2">
          <Avatar.Root>
            <Avatar.Image src={user.picture} alt={user.name} />
            <Avatar.Fallback class="text-sm">{user.name[0]}</Avatar.Fallback>
          </Avatar.Root>
          <div class="flex flex-col">
            <span class="text-sm">
              {user.name}
              {#if label}<span class="text-neutral-600 dark:text-neutral-400"
                  >({label})</span
                >{/if}
            </span>
            <span class="text-xs text-neutral-400 dark:text-neutral-600"
              >{user.email}</span
            >
          </div>
        </li>
      {/snippet}

      <ul class="space-y-2">
        {@render person(data.creator, "Creator")}
        {#each data.attendees as attendee}
          {@render person(attendee)}
        {/each}
      </ul>

      <Button size="sm" variant="secondary" onclick={copyShareLink}
        >Share invite link</Button
      >
    </div>
  </div>

  <hr class="-mr-4 lg:mr-0" />
  <p>{data.gathering.description}</p>

  <div class="gradient">
    <div
      class="mx-8 my-16 flex flex-col items-center space-y-6 rounded-md border bg-neutral-50/50 p-8 text-center backdrop-blur dark:bg-neutral-900/50"
    >
      {#if user && data.gathering.creatorId === user.id}
        <div>You created this gathering.</div>
        <Button onclick={copyShareLink}>Share invite link</Button>
      {:else if user && data.attendees.some((a) => a.id === user.id)}
        <div>You're all set, {user.givenName}!</div>
        <div>Now, we wait for the creator to confirm gathering times.</div>
        <PartyPopper />
      {:else}
        <div>
          {data.creator.givenName}'s invited you to join this gathering.
        </div>
        <form method="POST" action="?/join" use:enhance>
          {#if user}
            <Button type="submit">Join as {user.givenName}</Button>
          {:else}
            <Button type="submit"><Google />Continue with Google</Button>
          {/if}
        </form>
      {/if}
    </div>
  </div>
</main>

<style>
  .gradient {
    position: relative;

    &:after {
      background-image:
        radial-gradient(
          at 27% 37%,
          hsla(215, 98%, 61%, 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 97% 21%,
          hsla(256, 98%, 72%, 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 52% 99%,
          hsla(354, 98%, 61%, 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 10% 29%,
          hsla(133, 96%, 67%, 1) 0px,
          transparent 50%
        ),
        radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 1) 0px, transparent 50%),
        radial-gradient(
          at 33% 50%,
          hsla(222, 67%, 73%, 1) 0px,
          transparent 50%
        ),
        radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 1) 0px, transparent 50%);
      position: absolute;
      content: "";
      width: 100%;
      height: 100%;
      filter: blur(20px) saturate(150%);
      z-index: -1;
      top: 0;
      opacity: 0.2;
      transform: translateZ(0);
    }
  }
</style>
