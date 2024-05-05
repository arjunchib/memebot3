import type { Config } from "drizzle-kit";

export default {
  schema: "./legacy-db/schema.ts",
  out: "./legacy-db/drizzle",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./legacy-db/memebot.sqlite",
  },
} satisfies Config;
