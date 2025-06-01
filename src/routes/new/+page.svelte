<script lang="ts">
  import { enhance } from "$app/forms"
  import { Input } from "$lib/components/ui/input"
  import { Textarea } from "$lib/components/ui/textarea"
  import { Label } from "$lib/components/ui/label"
  import { Button } from "$lib/components/ui/button"
</script>

<header class="flex items-center justify-between border-b">
  <h1 class="mx-auto w-full max-w-xl p-4">New Gathering</h1>
</header>
<form method="POST" use:enhance class="mx-auto max-w-xl space-y-4 p-4">
  <div class="space-y-2">
    <Label for="title">Title</Label>
    <Input id="title" name="title" placeholder="Untitled Gathering" required />
  </div>
  <div class="space-y-2">
    <Label for="description">Description (Optional)</Label>
    <Textarea id="description" name="description" />
  </div>
  <div class="flex items-center justify-end space-x-2">
    <Button href="/" variant="ghost">Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</form>
