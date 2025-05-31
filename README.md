# `gather`

A simple web app to make finding times to meet easier.

Solutions like Calendly help find 1-1 meeting times.
Gather helps find group meeting times (3+ people).

[![UX Flow](./ux-flow.svg)](https://excalidraw.com/#json=3c7OosXrYE4bEfD7PDip1,k7eRZVv6HmHy9ookUG_C5A)

## Developing

Once you've installed dependencies with `pnpm install`, start a development server:

```bash
pnpm dev

# or start the server and open the app in a new browser tab
pnpm dev -- --open
```

## Building

To create a production version of your app:

```bash
pnpm build
```

You can preview the production build with `pnpm preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
