import { joinVoice, type $slash } from "peach";
import type { play } from "../commands";
import { db } from "../db/database";
import { eq } from "drizzle-orm";
import { commands } from "../db/schema";

export class PlayController {
  async play(interaction: $slash<typeof play>) {
    const { name } = interaction.options();
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
}
