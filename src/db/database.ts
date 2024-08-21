import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { memeTags, memes, tags, commands, keyValue } from "./schema";
import {
  commandsRelations,
  memeTagsRelations,
  memesRelations,
  tagsRelations,
} from "./relations";

const sqlite = new Database("memebot.sqlite", { create: true });
sqlite.exec("PRAGMA journal_mode=WAL;");
sqlite.exec("PRAGMA foreign_keys=ON;");
export const db = drizzle(sqlite, {
  schema: {
    memes,
    commands,
    tags,
    memeTags,
    keyValue,
    memesRelations,
    commandsRelations,
    tagsRelations,
    memeTagsRelations,
  },
});
