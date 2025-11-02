# just manual: https://github.com/casey/just

_list:
    @just --list

# Update all dependencies
[group('core')]
upgrade:
    pnpm up --recursive
    pnpm install

# Install all dependencies
[group('core')]
install *FLAGS:
    pnpm install {{FLAGS}}

# Generate SvelteKit route types
[group('core')]
prepare:
    pnpm svelte-kit sync

# Run all enforced linters
[group('core')]
check: prepare
    pnpm lint --max-warnings 0 --fix
    pnpm typecheck

# Run code formatters
[group('core')]
format:
    pnpm prettier -wl .

# Run all fixers
[group('core')]
fix: format check

# Start the application dev server
[group('core')]
dev:
    pnpm dev --host

# Start the application in preview mode
[group('core')]
preview:
    pnpm preview

# Build the production application
[group('core')]
build:
    pnpm build

# Add a new component, see https://www.shadcn-svelte.com
[group('components')]
add-component *COMPONENTS:
    pnpm dlx shadcn-svelte@next add {{COMPONENTS}}

# Push schema types to database (without a migration)
[group('database')]
push:
    pnpm drizzle-kit push

# Generate a migration based on schema types
[group('database')]
generate:
    pnpm drizzle-kit generate

# Run migrations
[group('database')]
migrate:
    pnpm drizzle-kit migrate

# Open UI to explore database, see https://orm.drizzle.team/drizzle-studio
[group('database')]
studio:
    pnpm drizzle-kit studio

# Start Storybook
[group('storybook')]
storybook:
    pnpm storybook dev -p 6006

# Build Storybook
[group('storybook')]
build-storybook:
    pnpm storybook build
