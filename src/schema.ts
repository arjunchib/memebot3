import { relations } from "drizzle-orm";
import {
  sqliteTable,
  numeric,
  real,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";

export const sequelizeMeta = sqliteTable("SequelizeMeta", {
  name: numeric("name").primaryKey().notNull(),
});

export const memes = sqliteTable("memes", {
  id: numeric("id").primaryKey().notNull(),
  name: numeric("name").notNull(),
  createdAt: numeric("createdAt").notNull(),
  updatedAt: numeric("updatedAt").notNull(),
  duration: real("duration"),
  size: integer("size"),
  bitRate: integer("bit_rate"),
  loudnessI: real("loudness_i"),
  loudnessLra: real("loudness_lra"),
  loudnessTp: real("loudness_tp"),
  loudnessThresh: real("loudness_thresh"),
  authorId: numeric("author_id"),
  playCount: integer("playCount").default(0).notNull(),
  randomPlayCount: integer("randomPlayCount").default(0).notNull(),
});

export const commands = sqliteTable("commands", {
  name: numeric("name").primaryKey().notNull(),
  memeId: integer("memeId").references(() => memes.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: numeric("createdAt").notNull(),
  updatedAt: numeric("updatedAt").notNull(),
});

export const commandsRelations = relations(commands, ({ one }) => ({
  meme: one(memes, {
    fields: [commands.memeId],
    references: [memes.id],
  }),
}));

export const tags = sqliteTable("tags", {
  name: numeric("name").primaryKey().notNull(),
  createdAt: numeric("createdAt").notNull(),
  updatedAt: numeric("updatedAt").notNull(),
});

export const memeTags = sqliteTable(
  "MemeTags",
  {
    memeId: integer("memeId")
      .notNull()
      .references(() => memes.id, { onDelete: "cascade", onUpdate: "cascade" }),
    tagName: numeric("tagName")
      .notNull()
      .references(() => tags.name, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    createdAt: numeric("createdAt").notNull(),
    updatedAt: numeric("updatedAt").notNull(),
  },
  (table) => {
    return {
      pk0: primaryKey({
        columns: [table.memeId, table.tagName],
        name: "MemeTags_memeId_tagName_pk",
      }),
    };
  }
);
