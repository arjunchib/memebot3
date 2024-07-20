import type { Config } from "drizzle-kit";

export default {
  schema: "./legacy-db/schema.ts",
  out: "./legacy-db/drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./legacy-db/memebot.sqlite",
  },
} satisfies Config;
