<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { Google } from "$lib/components/icons/google"
  import {
    ArrowRight,
    Clock,
    DoorOpen,
    MoreHorizontal,
    PartyPopper,
    Share,
    Trash,
    User,
    X,
  } from "@lucide/svelte"
  import { toast } from "svelte-sonner"
  import copy from "copy-to-clipboard"
  import { enhance } from "$app/forms"
  import * as Avatar from "$lib/components/ui/avatar"
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu"
  import { type User as UserT } from "$lib/server/db/schema"
  import { cn } from "$lib/utils"
  import { type TimePeriod } from "./+page.server"

  let { data } = $props()
  let user = $derived(data.user)
  let participantCount = $derived(data.attendees.length + 1)
  let showDeleteButton = $derived(user?.id === data.gathering.creatorId)
  let showLeaveButton = $derived(data.attendees.some((a) => a.id === user?.id))

  function copyShareLink() {
    if (copy(window.location.href)) {
      toast("Copied link to clipboard!")
    } else {
      toast("Could not copy link to clipboard. Try again later.")
    }
  }
</script>

<header
  class="bg-background/80 sticky top-0 z-10 flex items-center justify-between px-4 pt-4 pb-2 backdrop-blur lg:mx-auto lg:max-w-xl"
>
  <h2 class="text-sm font-medium text-neutral-400 dark:text-neutral-600">
    Gathering
  </h2>
  <div class="flex items-center gap-2">
    {#if showDeleteButton || showLeaveButton}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          class={buttonVariants({
            variant: "ghost",
            size: "icon",
            class: "size-7 rounded-full",
          })}
        >
          <MoreHorizontal />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content class="w-48">
          {#if showDeleteButton}
            <form method="POST" action="?/delete" use:enhance>
              <button type="submit" class="w-full">
                <DropdownMenu.Item class="!text-destructive">
                  <Trash class="text-destructive" />
                  Delete gathering
                </DropdownMenu.Item>
              </button>
            </form>
          {/if}
          {#if showLeaveButton}
            <form method="POST" action="?/leave" use:enhance>
              <button type="submit" class="w-full">
                <DropdownMenu.Item class="!text-destructive">
                  <DoorOpen class="text-destructive" />
                  Leave gathering
                </DropdownMenu.Item>
              </button>
            </form>
          {/if}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {/if}
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
<main class="space-y-4 px-4 lg:mx-auto lg:max-w-xl">
  <h1 class="text-xl">{data.gathering.title}</h1>

  <hr class="-mr-4 lg:mr-0" />
  <div class="flex space-x-4">
    <Clock
      class="mt-1 size-4 shrink-0 text-neutral-400 dark:text-neutral-600"
    />
    <div class="flex flex-col gap-2">
      {#snippet timeDisplay(time: TimePeriod)}
        <div class="flex items-center gap-2">
          <div class="w-24">
            {time?.start.toLocaleString(undefined, {
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
          <ArrowRight
            class="mr-2 size-4 text-neutral-400 dark:text-neutral-600"
          />
          <div>
            {time?.end.toLocaleString(undefined, {
              hour: "numeric",
              minute: "numeric",
            })}
          </div>
          <div class="text-neutral-400 dark:text-neutral-600">30m</div>
        </div>
        <div>
          {time?.start.toLocaleString(undefined, {
            weekday: "short",
            day: "numeric",
            month: "short",
            year:
              new Date().getFullYear() !== time.start.getFullYear()
                ? "numeric"
                : undefined,
          })}
        </div>
      {/snippet}
      {#snippet possibleTimeButton(time?: TimePeriod)}
        <button
          type={time ? "submit" : "button"}
          class={cn(
            buttonVariants({ variant: "outline" }),
            "gradient-border block h-16 w-64 px-3 py-0 text-left text-sm",
            time ? "done" : "cursor-wait",
          )}
        >
          <div class="gradient-border-outline"></div>
          {#if time}
            {@render timeDisplay(time)}
          {/if}
        </button>
      {/snippet}

      {#if data.gathering.start && data.gathering.end}
        {@render timeDisplay({
          start: data.gathering.start,
          end: data.gathering.end,
        })}
      {:else if data.gathering.creatorId === user?.id}
        {#await data.times}
          <p>Finding possible times...</p>
          {#each { length: 3 }}
            {@render possibleTimeButton()}
          {/each}
        {:then times}
          <p>Possible times</p>
          {#each times.slice(0, 3) as time}
            <form method="POST" action="?/time">
              <input
                type="hidden"
                name="start"
                value={time.start.toISOString()}
              />
              <input type="hidden" name="end" value={time.end.toISOString()} />
              {@render possibleTimeButton(time)}
            </form>
          {/each}
        {:catch error}
          <p class="text-destructive line-clamp-2">
            Error getting times: {error.message}
          </p>
        {/await}
      {:else}
        <p>The creator hasn't confirmed a time yet.</p>
      {/if}
    </div>
  </div>

  <hr class="-mr-4 lg:mr-0" />
  <div class="flex space-x-4">
    <User class="mt-1 size-4 shrink-0 text-neutral-400 dark:text-neutral-600" />
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
          {data.creator.givenName} has invited you to join this gathering.
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
  :root {
    --gradient-color-1: 215, 98%, 61%;
    --gradient-color-2: 256, 98%, 72%;
    --gradient-color-3: 354, 98%, 61%;
    --gradient-color-4: 133, 96%, 67%;
    --gradient-color-5: 38, 60%, 74%;
    --gradient-color-6: 222, 67%, 73%;
    --gradient-color-7: 343, 68%, 79%;
  }

  .gradient {
    position: relative;

    &:after {
      background-image:
        radial-gradient(
          at 27% 37%,
          hsla(var(--gradient-color-1), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 97% 21%,
          hsla(var(--gradient-color-2), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 52% 99%,
          hsla(var(--gradient-color-3), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 10% 29%,
          hsla(var(--gradient-color-4), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 97% 96%,
          hsla(var(--gradient-color-5), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 33% 50%,
          hsla(var(--gradient-color-6), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 79% 53%,
          hsla(var(--gradient-color-7), 1) 0px,
          transparent 50%
        );
      position: absolute;
      content: "";
      width: 100%;
      height: 100%;
      filter: blur(20px) saturate(150%);
      z-index: -1;
      top: 0;
      left: 0;
      opacity: 0.2;
      transform: translateZ(0);
    }
  }

  .gradient-border {
    --gradient-border-radius: var(--radius-md);
    position: relative;
    border-radius: var(--gradient-border-radius);

    & > .gradient-border-outline {
      position: absolute;
      inset: -1px;
      overflow: hidden;
      border-radius: var(--gradient-border-radius);
      z-index: -1;
    }

    & > .gradient-border-outline::before {
      content: "";
      position: absolute;
      inset: -20px;
      animation: gradient-border-spin 2.5s ease-in-out infinite;
      background: conic-gradient(
        hsla(var(--gradient-color-1), 0.8),
        hsla(var(--gradient-color-2), 0.6),
        hsla(var(--gradient-color-3), 0.4),
        hsla(var(--gradient-color-5), 0.1),
        hsla(var(--gradient-color-4), 0.4),
        hsla(var(--gradient-color-6), 0.6),
        hsla(var(--gradient-color-7), 0.8)
      );
      filter: blur(24px);
      opacity: 0;
    }

    &.done > .gradient-border-outline::before {
      background:
        radial-gradient(
          at 27% 37%,
          hsla(var(--gradient-color-1), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 97% 21%,
          hsla(var(--gradient-color-2), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 52% 99%,
          hsla(var(--gradient-color-3), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 10% 29%,
          hsla(var(--gradient-color-4), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 97% 96%,
          hsla(var(--gradient-color-5), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 33% 50%,
          hsla(var(--gradient-color-6), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 79% 53%,
          hsla(var(--gradient-color-7), 1) 0px,
          transparent 50%
        );
      animation-delay: 0.2s;
      animation: gradient-border-fade 2.5s ease-out forwards;
    }

    & > .gradient-border-outline::after {
      content: "";
      position: absolute;
      inset: 1.5px;
      border-radius: calc(var(--gradient-border-radius) - 1.5px);
      background: var(--background);
    }
  }

  @keyframes gradient-border-spin {
    0% {
      transform: rotate(0deg);
      opacity: 0;
    }
    15% {
      opacity: 1;
    }
    85% {
      opacity: 1;
    }
    to {
      transform: rotate(1turn);
      opacity: 0;
    }
  }

  @keyframes gradient-border-fade {
    0% {
      opacity: 0;
      filter: blur(24px);
    }
    50% {
      opacity: 1;
      filter: blur(24px);
    }
    to {
      opacity: 0;
      filter: blur(24px);
    }
  }
</style>
