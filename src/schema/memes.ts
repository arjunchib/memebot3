import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const memes = sqliteTable("memes", {
  id: integer("id").primaryKey(),
  name: text("name"),
  plays: integer("plays").default(0),
});
