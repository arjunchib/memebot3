import { commands } from "./commands";
import { routes } from "./routes";
import { mkdirSync } from "fs";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "./db/database";
import { logError } from "orange";
import { bootstrapGateway } from "peach";

try {
  mkdirSync("audio");
} catch {}
try {
  mkdirSync("waveform");
} catch {}

if (Bun.env.NODE_ENV === "production") {
  migrate(db, { migrationsFolder: "drizzle" });
}

await bootstrapGateway({
  applicationId: Bun.env.APPLICATION_ID!,
  token: Bun.env.TOKEN!,
  commands,
  routes,
  debug: !!Bun.env.DEBUG,
  syncCommands: {
    guildId: Bun.env.GUILD_ID!,
  },
  intents: 1 << 7,
  error: console.error,
});
