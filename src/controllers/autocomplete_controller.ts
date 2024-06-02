import { db } from "../db/database";
import { like, sql } from "drizzle-orm";
import { commands, tags } from "../db/schema";
import type { $focus } from "peach";

export class AutocompleteController {
  async meme(interaction: $focus<string>) {
    const name = interaction.focused;
    // group by meme so we can collapse commands into one entry
    const commandResults = await db
      .select({
        names: sql<string>`GROUP_CONCAT(${commands.name},';')`,
      })
      .from(commands)
      .where(like(commands.name, `%${name}%`))
      .groupBy(commands.memeId)
      .limit(25);
    const choices = commandResults.map((c) => {
      const name = c.names.split(";")?.[0];
      return {
        name,
        value: name,
      };
    });
    await interaction.respondWith(choices);
  }

  async tag(interaction: $focus<string>) {
    const tag = interaction.options;
    const myTags = await db.query.tags.findMany({
      where: like(tags.name, `%${tag}%`),
      limit: 25,
      columns: {
        name: true,
      },
    });
    await interaction.respondWith(
      myTags.map((t) => ({
        name: t.name,
        value: t.name,
      }))
    );
  }
}
