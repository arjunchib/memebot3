import * as memesSchema from "./schema/memes";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

const sqlite = new Database("sqlite.db", { create: true });
sqlite.exec("PRAGMA journal_mode=WAL;");
export const db = drizzle(sqlite, { schema: { ...memesSchema } });
