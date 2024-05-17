import { joinVoice, type $slash, type $autocomplete } from "peach";
import type { add, play } from "../commands";
import { db } from "../db/database";
import { eq, like, sql } from "drizzle-orm";
import { commands } from "../db/schema";

export class MemeController {
  async add(interaction: $slash<typeof add>) {
    const { name, url, start, end } = interaction.options;
    await interaction.respondWith(`Added ${name} with ${url}!`);
  }

  async play(interaction: $slash<typeof play>) {
    const { name } = interaction.options;
    const command = await db.query.commands.findFirst({
      where: eq(commands.name, name),
      with: { meme: { columns: { id: true, name: true } } },
    });
    const meme = command?.meme;
    if (!meme) {
      return await interaction.respondWith(`404 Meme not found`);
    }
    await interaction.respondWith(`Playing ${meme.name}`);
    const voiceConn = await joinVoice({
      channel_id: Bun.env.CHANNEL_ID!,
      guild_id: Bun.env.GUILD_ID!,
      self_deaf: true,
      self_mute: false,
    });
    const url = `${Bun.env.BUCKET!}/audio/${meme.id}.webm`;
    await voiceConn.playAudio(await fetch(url));
    voiceConn.disconnect();
  }

  async autocompleteName(interaction: $autocomplete<typeof play>) {
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
}
