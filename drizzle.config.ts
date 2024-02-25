import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/*",
  out: "./drizzle",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./sqlite.db",
  },
} satisfies Config;
