<script lang="ts">
  import { enhance } from "$app/forms"
  import { Button } from "$lib/components/ui/button"

  let { data } = $props()
</script>

<h1>Hi, {data.user.email}!</h1>
<p>Your user ID is {data.user.id}.</p>
<form method="post" action="?/logout" use:enhance>
  <Button type="submit">Sign out</Button>
</form>

{#await data.gatherings}
  <p>Loading gatherings...</p>
{:then gatherings}
  <ul>
    {#each gatherings as gathering}
      <li>{gathering.title}</li>
    {/each}
  </ul>
{:catch error}
  <p>Error loading gatherings: {error.message}</p>
{/await}

<Button href="/new">New gathering</Button>
