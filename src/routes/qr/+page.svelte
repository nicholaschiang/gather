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
      "https://gather.nicholaschiang.com/something/else/asdfasdf",
      qrcodegen.QrCode.Ecc.MEDIUM,
    )
    let border = 1
    let width = 175
    let scale = Math.floor(width / (qr.size + border * 2))
    qrcodegen.drawCanvas(qr, scale, border, "#FFFFFF", "#000000", canvas)
  })

  function copyShareLink() {
    if (copy(window.location.href)) {
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
    <div class="gradient relative mt-24">
      <div
        class="relative mx-8 my-16 flex flex-col items-center rounded-lg border bg-neutral-50/50 px-10 pt-8 pb-4 text-center backdrop-blur dark:bg-neutral-900/50"
      >
        <div class="absolute top-0 w-full">
          <div
            class="absolute bottom-0 flex w-full flex-col items-center justify-center"
          >
            <Avatar.Root class="size-20">
              <Avatar.Image src={data.user.picture} alt={data.user.name} />
              <Avatar.Fallback class="text-sm"
                >{data.user.name[0]}</Avatar.Fallback
              >
            </Avatar.Root>
            <h1 class="mt-2 mb-6 text-lg font-medium">{data.user.name}</h1>
          </div>
        </div>
        <canvas class="rounded" bind:this={canvas}></canvas>
        <ShinyText class="mt-2 text-4xl font-semibold"
          ><span class="font-black">G</span>ather</ShinyText
        >
        <div class="absolute bottom-0 w-full">
          <div class="absolute top-4 w-full">
            <Button onclick={copyShareLink} variant="ghost">
              <Copy />
              Copy profile link
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<style>
  :root {
    --gradient-color-1: 215, 98%, 61%;
    --gradient-color-2: 256, 98%, 72%;
    --gradient-color-3: 354, 98%, 61%;
    --gradient-color-4: 133, 96%, 67%;
    --gradient-color-5: 38, 60%, 74%;
    --gradient-color-6: 222, 67%, 73%;
    --gradient-color-7: 343, 68%, 79%;
  }

  .gradient {
    position: relative;

    &:after {
      background-image:
        radial-gradient(
          at 27% 37%,
          hsla(var(--gradient-color-1), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 97% 21%,
          hsla(var(--gradient-color-2), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 52% 99%,
          hsla(var(--gradient-color-3), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 10% 29%,
          hsla(var(--gradient-color-4), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 97% 96%,
          hsla(var(--gradient-color-5), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 33% 50%,
          hsla(var(--gradient-color-6), 1) 0px,
          transparent 50%
        ),
        radial-gradient(
          at 79% 53%,
          hsla(var(--gradient-color-7), 1) 0px,
          transparent 50%
        );
      position: absolute;
      content: "";
      width: 100%;
      height: 100%;
      filter: blur(20px) saturate(150%);
      z-index: -1;
      top: 0;
      left: 0;
      opacity: 0.2;
      transform: translateZ(0);
    }
  }
</style>
