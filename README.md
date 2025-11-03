# `gather`

A simple web app to make finding times to meet easier.

Solutions like Calendly help find 1-1 meeting times.
Gather helps find group meeting times (3+ people).

## Terminology

- A `user` is a person.
- A `user` can follow other `users`.
- A `user` can have a private account (by default) or a public account.
- A `user` is friends with another `user` if they both follow each other.
- A `gathering` is an event with `users`, a title, and a creator.

## Developing

To view all commands provided by our `Justfile`:

```bash
just
```

...this includes recipes to generate database migrations, run linters, format code, and more.

Once you've installed dependencies with `just install`, start a development server:

```bash
just dev

# or start the server and open the app in a new browser tab
just dev --open
```

## Building

To create a production version of your app:

```bash
just build
```

You can preview the production build with `just preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
