<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { ChevronLeft, ChevronRight } from "@lucide/svelte"
  import { HEADER_HEIGHT, HOUR_HEIGHT } from "./constants"

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
      <!-- 1st day column -->
      <div>
        <div
          style:height="{HEADER_HEIGHT}px"
          class="bg-background sticky top-0 z-10 flex items-center justify-center border-b text-sm"
        >
          {formatDate(data.timeMin)}
        </div>
        <div class="relative border-l">
          {#each hours}
            <div style:height="{HOUR_HEIGHT}px" class="border-b"></div>
          {/each}
          <div class="absolute top-0 right-4 bottom-0 left-0">
            {#each data.yourEvents?.filter((event) => event.start.getDay() === data.timeMin.getDay()) as event (event.id)}
              <div
                style:top="{getEventPosition(event.start)}px"
                style:height="{getEventHeight(event.start, event.end)}px"
                class="absolute w-full rounded bg-blue-100 p-1 text-xs dark:bg-blue-900"
              >
                {event.title}
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- 2nd day column -->
      <div>
        <div
          style:height="{HEADER_HEIGHT}px"
          class="bg-background sticky top-0 z-10 flex items-center justify-center border-b text-sm"
        >
          {formatDate(new Date(data.timeMax.valueOf() - 1))}
        </div>
        <div class="relative border-l">
          {#each hours}
            <div style:height="{HOUR_HEIGHT}px" class="border-b"></div>
          {/each}
          <div class="absolute top-0 right-4 bottom-0 left-0">
            {#each data.yourEvents?.filter((event) => event.start.getDay() === new Date(data.timeMax.valueOf() - 1).getDay()) as event (event.id)}
              <div
                style:top="{getEventPosition(event.start)}px"
                style:height="{getEventHeight(event.start, event.end)}px"
                class="absolute w-full rounded bg-blue-100 p-1 text-xs dark:bg-blue-900"
              >
                {event.title}
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
