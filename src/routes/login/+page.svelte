<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  let { data } = $props()
</script>

<Button href={data.authorizationUrl}>Login with Google</Button>
