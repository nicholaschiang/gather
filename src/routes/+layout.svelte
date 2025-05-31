<script lang="ts">
  import "../app.css"
  import "@fontsource-variable/inter/opsz.css"
  import { Toaster } from "$lib/components/ui/sonner"

  let { children } = $props()
</script>

<Toaster />

{@render children()}
