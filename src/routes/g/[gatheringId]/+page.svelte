<script lang="ts">
  let { data } = $props()
</script>

{#await data.gathering}
  <p>Loading gathering...</p>
{:then gathering}
  <h1>{gathering.title}</h1>
  <p>{gathering.description}</p>
{:catch error}
  <p>Error loading gathering: {error.message}</p>
{/await}
