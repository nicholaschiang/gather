<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { ShinyText } from "$lib/components/ui/shiny-text"
  import * as Avatar from "$lib/components/ui/avatar"
  import { qrcodegen } from "$lib/qrcodegen"
  import { Copy, X } from "@lucide/svelte"
  import { toast } from "svelte-sonner"
  import copy from "copy-to-clipboard"

  let { data } = $props()

  let canvas: HTMLCanvasElement
  $effect(() => {
    let qr = qrcodegen.QrCode.encodeText(
      data.profileLink,
      qrcodegen.QrCode.Ecc.MEDIUM,
    )
    let border = 1
    let width = 200
    let scale = Math.floor(width / (qr.size + border * 2))
    qrcodegen.drawCanvas(qr, scale, border, "#FFFFFF", "#000000", canvas)
  })

  function copyProfileLink() {
    if (copy(data.profileLink)) {
      toast("Copied link to clipboard!")
    } else {
      toast("Could not copy link to clipboard. Try again later.")
    }
  }
</script>

<main class="mx-auto max-w-xl p-4">
  <header>
    <Button href="/" size="icon" variant="secondary"><X /></Button>
  </header>
  <div class="mt-8 flex flex-col items-center">
    <div class="gradient relative mt-30">
      <div
        class="relative m-8 flex flex-col items-center rounded-lg border bg-neutral-50/50 px-10 pt-8 pb-6 text-center backdrop-blur dark:bg-neutral-900/50"
      >
        <div class="absolute top-0 w-full">
          <div
            class="absolute bottom-0 flex w-full flex-col items-center justify-center"
          >
            <Avatar.Root class="size-20">
              <Avatar.Image src={data.user.picture} alt={data.user.name} />
              <Avatar.Fallback>{data.user.name[0]}</Avatar.Fallback>
            </Avatar.Root>
            <h1 class="mt-2 mb-6 text-lg font-semibold">{data.user.name}</h1>
          </div>
        </div>
        <canvas class="rounded" bind:this={canvas}></canvas>
        <ShinyText class="mt-1 text-4xl font-bold">gather</ShinyText>
        <div class="absolute bottom-0 w-full">
          <div class="absolute top-4 w-full">
            <Button onclick={copyProfileLink} variant="ghost">
              <Copy />
              Copy profile link
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
