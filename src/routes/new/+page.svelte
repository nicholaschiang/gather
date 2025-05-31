<script lang="ts">
  import { enhance } from "$app/forms"
  import { Input } from "$lib/components/ui/input"
  import { Label } from "$lib/components/ui/label"
  import { Button } from "$lib/components/ui/button"
</script>

<header class="flex items-center justify-between border-b">
  <h1 class="mx-auto w-full max-w-lg p-4">New Gathering</h1>
</header>
<form method="POST" use:enhance class="mx-auto max-w-lg space-y-4 p-4">
  <div class="space-y-2">
    <Label for="title">Title</Label>
    <Input id="title" name="title" />
  </div>
  <div class="space-y-2">
    <Label for="description">Description</Label>
    <Input id="description" name="description" />
  </div>
  <div class="flex items-center justify-end space-x-2">
    <Button href="/" variant="ghost">Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</form>
