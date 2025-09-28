import type { $autocomplete, $slash } from "peach";
import {
  listTags,
  type addCommand,
  type addTag,
  type removeCommand,
  type removeTag,
  type rename,
} from "../commands";
import { db } from "../db/database";
import { and, eq, sql } from "drizzle-orm";
import { commands, memeTags, memes, tags } from "../db/schema";

export class TagController {
  async addTag(interaction: $slash<typeof addTag>) {
    const { meme, tag } = interaction.options();
    const memeId = await this.findMeme(meme);
    await db.transaction(async (tx) => {
      await tx.insert(tags).values({ name: tag }).onConflictDoNothing();
      await tx
        .insert(memeTags)
        .values({ memeId, tagName: tag })
        .onConflictDoNothing();
    });
    await interaction.respondWith(
      `Updated ***${meme}*** by adding tag ***${tag}***`
    );
  }

  async removeTag(interaction: $slash<typeof removeTag>) {
    const { meme, tag } = interaction.options();
    const memeId = await this.findMeme(meme);
    await db
      .delete(memeTags)
      .where(and(eq(memeTags.memeId, memeId), eq(memeTags.tagName, tag)));
    await interaction.respondWith(
      `Updated ***${meme}*** by removing tag ***${tag}***`
    );
  }

  async listTags(interaction: $slash<typeof listTags>) {
    const results = await db
      .select({
        tag: memeTags.tagName,
        count: sql<number>`count(*)`,
      })
      .from(memeTags)
      .groupBy(memeTags.tagName);
    const output = results
      .sort((a, b) => b.count - a.count)
      .map(({ count, tag }) => `${count.toString().padStart(3)} ${tag}`)
      .join("\n");
    await interaction.respondWith("```" + output + "```");
  }

  async removeTagAutocomplete(interaction: $autocomplete<typeof removeTag>) {
    const commandName = interaction.options().meme;
    const myCommand = await db.query.commands.findFirst({
      where: eq(commands.name, commandName),
      with: {
        meme: {
          with: {
            memeTags: {
              columns: {
                tagName: true,
              },
            },
          },
        },
      },
    });
    const choices = myCommand?.meme.memeTags.map((mt) => mt.tagName);
    await interaction.respondWith(choices || []);
  }

  private async findMeme(commandName: string) {
    const myCommand = await db.query.commands.findFirst({
      where: eq(commands.name, commandName),
    });
    const memeId = myCommand?.memeId;
    if (!memeId) throw new Error("Could not find meme");
    return memeId;
  }
}
