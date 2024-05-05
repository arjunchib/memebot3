import { relations } from "drizzle-orm";
import { commands, memeTags, memes, tags } from "./schema";

export const memesRelations = relations(memes, ({ many }) => ({
  commands: many(commands),
  memeTags: many(memeTags),
}));

export const commandsRelations = relations(commands, ({ one }) => ({
  meme: one(memes, {
    fields: [commands.memeId],
    references: [memes.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  memeTags: many(memeTags),
}));

export const memeTagsRelations = relations(memeTags, ({ one }) => ({
  meme: one(memes, {
    fields: [memeTags.memeId],
    references: [memes.id],
  }),
  tag: one(tags, {
    fields: [memeTags.tagName],
    references: [tags.name],
  }),
}));
