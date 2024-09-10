import type { $autocomplete, $slash } from "peach";
import {
  type addCommand,
  type addTag,
  type removeCommand,
  type removeTag,
  type rename,
} from "../commands";
import { db } from "../db/database";
import { and, eq, sql } from "drizzle-orm";
import { commands, memeTags, memes, tags } from "../db/schema";

export class EditController {
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

  async addCommand(interaction: $slash<typeof addCommand>) {
    const { meme, command } = interaction.options();
    const memeId = await this.findMeme(meme);
    await db.insert(commands).values({
      name: command,
      memeId,
    });
    await interaction.respondWith(
      `Updated ***${meme}*** by adding command ***${command}***`
    );
  }

  async removeCommand(interaction: $slash<typeof removeCommand>) {
    const { meme, command } = interaction.options();
    const memeId = await this.findMeme(meme);
    await db
      .delete(commands)
      .where(and(eq(commands.name, command), eq(commands.memeId, memeId)));
    await interaction.respondWith(
      `Updated ***${meme}*** by removing command ***${command}***`
    );
  }

  async rename(interaction: $slash<typeof rename>) {
    const { meme, name } = interaction.options();
    await db
      .update(memes)
      .set({
        name,
        // TODO: remove once this is fixed https://github.com/drizzle-team/drizzle-orm/issues/2388
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(memes.name, meme));
    await interaction.respondWith(
      `Updated ***${meme}*** by renaming to ***${name}***`
    );
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

  async removeCommandAutocomplete(
    interaction: $autocomplete<typeof removeCommand>
  ) {
    const commandName = interaction.options().meme;
    const myCommand = await db.query.commands.findFirst({
      where: eq(commands.name, commandName),
      with: {
        meme: {
          with: {
            commands: {
              columns: {
                name: true,
              },
            },
          },
        },
      },
    });
    const choices = myCommand?.meme.commands.map((c) => c.name);
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
