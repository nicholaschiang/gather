<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button"
  import { ArrowRight, ChevronLeft, ChevronRight } from "@lucide/svelte"
  import { HEADER_HEIGHT, HOUR_HEIGHT } from "./constants"
  import { enhance } from "$app/forms"
  import { cn } from "$lib/utils"
  import { type TimePeriod } from "./+page.server"

  const GATHERING_DURATION_MINS = 30
  const MS_IN_AN_HOUR = 60 * 60 * 1000
  const { data } = $props()

  function formatHour(hour: number) {
    const date = new Date()
    date.setHours(hour, 0, 0, 0)
    return date
      .toLocaleTimeString(undefined, { hour: "numeric" })
      .replaceAll(" ", "")
  }

  function formatDate(date: Date) {
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
    })
  }

  function formatPart(options: Intl.DateTimeFormatOptions) {
    return Intl.DateTimeFormat(undefined, options)
      .formatToParts()
      .find((part) => Object.keys(options).some((key) => part.type === key))
      ?.value
  }

  function getEventHeight(start: Date, end: Date) {
    const duration = end.valueOf() - start.valueOf()
    const hours = duration / MS_IN_AN_HOUR
    const height = hours * HOUR_HEIGHT
    return height
  }

  function getEventPosition(start: Date) {
    const zero = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
    )
    const hours = (start.valueOf() - zero.valueOf()) / MS_IN_AN_HOUR
    const x = hours * HOUR_HEIGHT
    return x
  }

  const timeZoneName = formatPart({ timeZoneName: "short" })
  const month = formatPart({ month: "long" })
  const hours = Array(24)
    .fill(null)
    .map((_, index) => index)
</script>

<main class="flex h-screen w-screen flex-col overflow-hidden">
  <!-- Header (with month name) -->
  <header class="flex items-center space-x-2 border-b p-2">
    <Button href="/" variant="ghost" size="icon" class="size-7 rounded-full">
      <ChevronLeft />
    </Button>
    <h1 class="text-lg">{month}</h1>
    <Button
      href="/"
      variant="ghost"
      size="icon"
      class="ml-auto size-7 rounded-full"
    >
      <ChevronRight />
    </Button>
  </header>

  <div class="flex h-0 grow overflow-x-hidden overflow-y-auto">
    <!-- Hour labels (with time zone name) -->
    <div class="flex-none">
      <div
        style:height="{HEADER_HEIGHT}px"
        class="bg-background sticky top-0 z-10 flex items-center justify-end border-b px-1 text-xs text-neutral-400 dark:text-neutral-600"
      >
        {timeZoneName}
      </div>
      {#each hours as hour}
        {#if hour === 0}
          <div style:height="{HOUR_HEIGHT / 2}px"></div>
        {:else}
          <div
            style:height="{HOUR_HEIGHT}px"
            class="flex items-center justify-end px-1 text-xs text-neutral-400 dark:text-neutral-600"
          >
            {formatHour(hour)}
          </div>
        {/if}
      {/each}
    </div>

    <!-- 2-day grid -->
    <div class="grid w-0 grow grid-cols-2">
      {#snippet column(date: Date)}
        <div>
          <div
            style:height="{HEADER_HEIGHT}px"
            class="bg-background sticky top-0 z-10 flex items-center justify-center border-b text-sm"
          >
            {formatDate(date)}
          </div>
          <div class="relative border-l">
            {#each hours}
              <div style:height="{HOUR_HEIGHT}px" class="border-b"></div>
            {/each}
            <div class="absolute inset-0">
              {#each data.friendBusyTimes.filter((busyTime) => busyTime.start.getDay() === date.getDay()) as busyTime (busyTime.id)}
                <div
                  style:top="{getEventPosition(busyTime.start)}px"
                  style:height="{getEventHeight(busyTime.start, busyTime.end) -
                    1}px"
                  class="absolute -z-10 w-full bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:10px_10px] bg-fixed [--pattern-fg:var(--color-neutral-950)]/5 dark:[--pattern-fg:var(--color-white)]/10"
                ></div>
              {/each}
              {#each data.yourEvents.filter((event) => event.start.getDay() === date.getDay()) as event (event.id)}
                <div
                  style:top="{getEventPosition(event.start)}px"
                  style:height="{getEventHeight(event.start, event.end) - 3}px"
                  class="absolute w-full pr-2"
                >
                  <div
                    class="h-full rounded border-l-4 border-l-indigo-100 bg-indigo-50 p-1 text-xs dark:border-l-indigo-900 dark:bg-indigo-950"
                  >
                    {event.title}
                  </div>
                </div>
              {/each}
              {#each data.availableTimes.filter((availableTime) => availableTime.start.getDay() === date.getDay()) as availableTime}
                <form
                  style:top="{getEventPosition(availableTime.start)}px"
                  style:height="{getEventHeight(
                    availableTime.start,
                    availableTime.end,
                  ) - 3}px"
                  class="absolute w-full pr-2"
                  method="POST"
                  action="?/time"
                  use:enhance
                >
                  <input
                    type="hidden"
                    name="start"
                    value={availableTime.start.toISOString()}
                  />
                  <input
                    type="hidden"
                    name="end"
                    value={availableTime.end.toISOString()}
                  />
                  <button
                    type="submit"
                    class="group gradient-border hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:hover:bg-input/50 flex h-full w-full shadow-xs"
                  >
                    <div class="gradient-border-outline"></div>
                    <div class="gradient-border-content p-1">
                      <span class="flex items-center text-xs">
                        Send invite for {formatHour(
                          availableTime.start.getHours(),
                        )}
                        <ChevronRight
                          class="h-4 w-4 transition group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </button>
                </form>
              {/each}
            </div>
          </div>
        </div>
      {/snippet}

      <!-- 1st day column -->
      {@render column(data.timeMin)}

      <!-- 2nd day column -->
      {@render column(new Date(data.timeMax.valueOf() - 1))}
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

  .gradient-border {
    --gradient-border-radius: var(--radius-sm);
    position: relative;
    border-radius: var(--gradient-border-radius);
    cursor: pointer;

    & > .gradient-border-content {
      border-radius: var(--gradient-border-radius);
      border-left-color: hsla(var(--gradient-color-4), 0.25);
      border-left-width: 4px;
      border-left-style: solid;
    }

    & > .gradient-border-outline {
      position: absolute;
      inset: 0px;
      overflow: hidden;
      border-radius: var(--gradient-border-radius);
      z-index: -1;
    }

    .gradient-border-outline::before {
      content: "";
      position: absolute;
      inset: -20px;
      filter: blur(24px);
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
    }

    & > .gradient-border-outline::after {
      content: "";
      position: absolute;
      inset: 1px;
      border-radius: calc(var(--gradient-border-radius) - 1px);
      background: var(--color-neutral-950);
      transition: background var(--default-transition-timing-function)
        var(--default-transition-duration);
    }

    &:hover > .gradient-border-outline::after {
      background: var(--color-neutral-900);
    }
  }
</style>
