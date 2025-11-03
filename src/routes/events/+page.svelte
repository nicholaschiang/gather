<script lang="ts">
  let { data } = $props()
</script>

{#await data.events}
  <p>Loading events...</p>
{:then events}
  <ul>
    {#each events as event (event.id)}
      <li>{event.start?.dateTime ?? event.start?.date} - {event.summary}</li>
    {/each}
  </ul>
{:catch error}
  <p>Error loading events: {error.message}</p>
{/await}
