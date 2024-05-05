import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { memeTags, memes, tags, commands } from "./schema";
import {
  commandsRelations,
  memeTagsRelations,
  memesRelations,
  tagsRelations,
} from "./relations";

const sqlite = new Database("memebot.sqlite", { create: true });
sqlite.exec("PRAGMA journal_mode=WAL;");
export const db = drizzle(sqlite, {
  schema: {
    memes,
    commands,
    tags,
    memeTags,
    memesRelations,
    commandsRelations,
    tagsRelations,
    memeTagsRelations,
  },
});
