<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Google } from "$lib/components/icons/google"
  import { enhance } from "$app/forms"
  import * as Avatar from "$lib/components/ui/avatar"
  import { ShinyText } from "$lib/components/ui/shiny-text"

  let { data } = $props()
</script>

<main class="mx-auto flex max-w-xl flex-col items-center px-4 py-16">
  <div class="gradient">
    <div
      class="m-8 flex flex-col items-center space-y-6 rounded-lg border bg-neutral-50/50 p-8 text-center backdrop-blur dark:bg-neutral-900/50"
    >
      <Avatar.Root class="size-20">
        <Avatar.Image src={data.friend.picture} alt={data.friend.name} />
        <Avatar.Fallback>{data.friend.name[0]}</Avatar.Fallback>
      </Avatar.Root>
      <article class="max-w-3xs text-center">
        <p>
          <strong>{data.friend.name}</strong> has invited you to be their friend
          on <ShinyText class="font-bold">Gather</ShinyText>.
        </p>
      </article>
      <form method="POST" action="?/accept" use:enhance>
        {#if data.user}
          <Button type="submit">Accept invite as {data.user.givenName}</Button>
        {:else}
          <Button type="submit"><Google />Continue with Google</Button>
        {/if}
      </form>
    </div>
  </div>
</main>
