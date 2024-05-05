import { joinVoice } from "peach";
import type { Interactions } from "../commands";
import { db } from "../db/database";
import { eq, like } from "drizzle-orm";
import { commands, memes } from "../db/schema";

export class MemeController {
  async add(interaction: Interactions["slash"]["add"]) {
    const { name, url } = interaction.options;
    await interaction.respondWith(`Added ${name} with ${url}!`);
  }

  async play(interaction: Interactions["slash"]["play"]) {
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

  async autocompletePlay(interaction: Interactions["autocomplete"]["play"]) {
    const name = interaction.options.name.value;
    const commandResults = await db.query.commands.findMany({
      where: like(commands.name, `${name}%`),
      limit: 25,
    });
    const choices = commandResults.map((c) => ({
      name: c.name,
      value: c.name,
    }));
    await interaction.respondWith(choices);
  }
}
