<script lang="ts">
  import { enhance } from "$app/forms"
  import { Input } from "$lib/components/ui/input"
  import { Label } from "$lib/components/ui/label"
  import { Button } from "$lib/components/ui/button"
  import * as Avatar from "$lib/components/ui/avatar"
  import { X } from "@lucide/svelte"

  let { data } = $props()
</script>

<header class="border-b">
  <div class="mx-auto flex w-full max-w-xl items-center justify-between p-4">
    <h1>Add friend</h1>
    <Button variant="secondary" href="/" size="icon" class="size-7 rounded-full"
      ><X /></Button
    >
  </div>
</header>
<main class="mx-auto max-w-xl space-y-4 p-4">
  <form
    method="GET"
    data-sveltekit-replacestate
    data-sveltekit-keepfocus
    class="space-y-2"
  >
    <Label for="search">Search by email address</Label>
    <div class="flex items-center space-x-2">
      <Input
        id="search"
        defaultValue={data.search}
        name="search"
        placeholder="mybestie@gmail.com"
        required
      />
      <Button variant="outline" type="submit">Search</Button>
    </div>
  </form>
  {#each data.users as user}
    <form
      method="POST"
      use:enhance
      class="flex items-center space-x-3 rounded-md border p-3"
    >
      <Avatar.Root>
        <Avatar.Image src={user.picture} alt={user.name} />
        <Avatar.Fallback class="text-sm">{user.name[0]}</Avatar.Fallback>
      </Avatar.Root>
      <Input type="hidden" name="userId" value={user.id} />
      <div>
        <h2 class="text-sm">{user.name}</h2>
        <p class="text-xs text-neutral-500">{user.email}</p>
      </div>
      <Button class="ml-auto" type="submit">Add friend</Button>
    </form>
  {/each}
</main>
