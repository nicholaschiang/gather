<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { page } from "$app/state"
</script>

<main class="flex h-screen w-screen flex-col items-center justify-center p-2">
  <h1>{page.status}</h1>
  <h2>{page.error?.message ?? "Error"}</h2>
  <Button href="/" size="sm" class="mt-8">Go back home</Button>
</main>
