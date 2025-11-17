<script lang="ts">
  import { enhance } from "$app/forms"
  import { Input } from "$lib/components/ui/input"
  import { Label } from "$lib/components/ui/label"
  import { Button } from "$lib/components/ui/button"

  let { data } = $props()
</script>

<header class="flex items-center justify-between border-b">
  <h1 class="mx-auto w-full max-w-xl p-4">Edit profile</h1>
</header>
<form method="POST" use:enhance class="mx-auto max-w-xl space-y-4 p-4">
  <div class="space-y-2">
    <Label for="givenName">First name</Label>
    <Input
      id="givenName"
      defaultValue={data.user.givenName}
      name="givenName"
      placeholder="John"
      required
    />
  </div>
  <div class="space-y-2">
    <Label for="familyName">Last name</Label>
    <Input
      id="familyName"
      defaultValue={data.user.familyName}
      name="familyName"
      placeholder="Doe"
      required
    />
  </div>
  <div class="space-y-2">
    <Label for="email">Email address</Label>
    <Input
      id="email"
      name="email"
      value={data.user.email}
      placeholder="john.doe@example.com"
      disabled
      readonly
    />
    <p class="text-xs text-neutral-500">
      To change your email, log out and log in with the other email.
    </p>
  </div>
  <div class="flex items-center justify-end space-x-2">
    <Button href="/" variant="ghost">Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</form>
