import { type $autocomplete } from "peach";
import type { play } from "../commands";
import { db } from "../db/database";
import { like, sql } from "drizzle-orm";
import { commands, tags } from "../db/schema";
import type { AutocompleteInteraction } from "peach/lib/interactions/autocomplete_interaction";
import type { SlashCommand } from "peach/lib/commands/slash_command";

export class AutocompleteController {
  async name(interaction: $autocomplete<typeof play>) {
    const name = interaction.options.name?.value;
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

  async tags(interaction: AutocompleteInteraction<SlashCommand>) {
    const tag = (interaction.options as any).tag?.value;
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
