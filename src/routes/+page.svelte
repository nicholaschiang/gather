<script lang="ts">
  import { enhance } from "$app/forms"
  import Button from "$lib/components/ui/button/button.svelte";
 
  let { data } = $props()
</script>

<h1>Hi, {data.user.email}!</h1>
<p>Your user ID is {data.user.id}.</p>
<form method="post" action="?/logout" use:enhance>
  <Button type="submit">Sign out</Button>
</form>
{#await data.events}
  <p>Loading events...</p>
{:then events}
  <ul>
    {#each events as event}
      <li>{event.start?.dateTime ?? event.start?.date} - {event.summary}</li>
    {/each}
  </ul>
{:catch error}
  <p>Error loading events: {error.message}</p>
{/await}
