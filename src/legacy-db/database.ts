import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { memeTags, memes, tags, commands, commandsRelations } from "./schema";

const sqlite = new Database("./memebot-legacy.sqlite");
export const dbLegacy = drizzle(sqlite, {
  schema: { memes, tags, memeTags, commands, commandsRelations },
});
