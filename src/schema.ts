import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const memes = sqliteTable("memes", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$onUpdate(() => sql`(unixepoch())`),
  duration: real("duration").notNull(),
  size: integer("size").notNull(),
  bitRate: integer("bit_rate").notNull(),
  loudnessI: real("loudness_i").notNull(),
  loudnessLra: real("loudness_lra").notNull(),
  loudnessTp: real("loudness_tp").notNull(),
  loudnessThresh: real("loudness_thresh").notNull(),
  authorId: text("author_id"),
  playCount: integer("play_count").notNull().default(0),
  randomPlayCount: integer("random_play_count").notNull().default(0),
});

export const commands = sqliteTable("commands", {
  name: text("name").primaryKey().notNull(),
  memeId: text("meme_id")
    .notNull()
    .references(() => memes.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$onUpdate(() => sql`(unixepoch())`),
});

export const tags = sqliteTable("tags", {
  name: text("name").primaryKey().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$onUpdate(() => sql`(unixepoch())`),
});

export const memeTags = sqliteTable(
  "meme_tags",
  {
    memeId: text("meme_id")
      .notNull()
      .references(() => memes.id, { onDelete: "cascade", onUpdate: "cascade" }),
    tagName: text("tag_name")
      .notNull()
      .references(() => tags.name, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$onUpdate(() => sql`(unixepoch())`),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.memeId, table.tagName],
      }),
    };
  }
);
