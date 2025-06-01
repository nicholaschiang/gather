<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Google } from "$lib/components/icons/google"
  import { ShinyText } from "$lib/components/ui/shiny-text"
  import { enhance } from "$app/forms"
</script>

<main
  class="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center space-y-12 p-4"
>
  <header class="flex flex-col items-center">
    <ShinyText class="text-8xl font-black">G</ShinyText>
    <h2 class="text-lg font-semibold">gather</h2>
  </header>
  <form method="POST" action="?/login" use:enhance>
    <Button type="submit"><Google />Continue with Google</Button>
  </form>
</main>
