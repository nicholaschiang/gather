import { defineConfig, type Config } from "drizzle-kit"

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set")

let config: Config

if (process.env.DATABASE_AUTH_TOKEN) {
  config = defineConfig({
    schema: "./src/lib/server/db/schema.ts",
    dbCredentials: {
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
    verbose: true,
    strict: true,
    dialect: "turso",
  })
} else {
  config = defineConfig({
    schema: "./src/lib/server/db/schema.ts",
    dbCredentials: { url: process.env.DATABASE_URL },
    verbose: true,
    strict: true,
    dialect: "sqlite",
  })
}

export default config
