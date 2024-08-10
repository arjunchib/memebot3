import { bootstrap } from "peach";
import { commands } from "./commands";
import { routes } from "./routes";
import { mkdirSync } from "fs";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "./db/database";

try {
  mkdirSync("audio");
} catch {}

if (Bun.env.NODE_ENV === "production") {
  migrate(db, { migrationsFolder: "drizzle" });
}

await bootstrap({
  applicationId: Bun.env.APPLICATION_ID!,
  token: Bun.env.TOKEN!,
  commands,
  routes,
  debug: Bun.env.NODE_ENV !== "production",
  syncCommands: {
    guildId: Bun.env.GUILD_ID!,
  },
  intents: 1 << 7,
});
