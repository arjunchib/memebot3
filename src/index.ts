import { bootstrap } from "peach";
import { commands } from "./commands";
import { commands as commandsDb, memes } from "./db/schema";
import { routes } from "./routes";
import { mkdirSync } from "fs";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "./db/database";
import { notInArray } from "drizzle-orm";

try {
  mkdirSync("audio");
} catch {}
try {
  mkdirSync("waveform");
} catch {}

if (Bun.env.NODE_ENV === "production") {
  migrate(db, { migrationsFolder: "drizzle" });
}

// remove broken memes
const memeIds = (await db.query.memes.findMany({ columns: { id: true } })).map(
  (m) => m.id
);
const deleted = await db
  .delete(commandsDb)
  .where(notInArray(commandsDb.memeId, memeIds))
  .returning();
console.log(`Deleted ${deleted.length} commands`);

await bootstrap({
  applicationId: Bun.env.APPLICATION_ID!,
  token: Bun.env.TOKEN!,
  commands,
  routes,
  debug: !!Bun.env.DEBUG,
  syncCommands: {
    guildId: Bun.env.GUILD_ID!,
  },
  intents: 1 << 7,
});
