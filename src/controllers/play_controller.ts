import { joinVoice, type $slash } from "peach";
import type { play, random } from "../commands";
import { db } from "../db/database";
import { eq, sql } from "drizzle-orm";
import { commands, memes } from "../db/schema";
import type { SlashInteraction } from "peach/lib/interactions/slash_interaction";
import { logError } from "orange";

export class PlayController {
  async play(interaction: $slash<typeof play>) {
    const name = interaction.options().meme;
    const command = await db.query.commands.findFirst({
      where: eq(commands.name, name),
      with: { meme: { columns: { id: true, name: true, playCount: true } } },
    });
    const meme = command?.meme;
    if (!meme) {
      return await interaction.respondWith(`404 Meme not found`);
    }
    await this.playAudio(meme.id, interaction, meme.name);
    await db
      .update(memes)
      .set({
        playCount: meme.playCount + 1,
        // TODO: remove once this is fixed https://github.com/drizzle-team/drizzle-orm/issues/2388
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(memes.id, meme.id));
  }

  async random(interaction: $slash<typeof random>) {
    const allMemes = await db.query.memes.findMany({ columns: { id: true } });
    const randIdx = Math.floor(Math.random() * allMemes.length);
    const id = allMemes[randIdx].id;
    const meme = await db.query.memes.findFirst({
      where: eq(memes.id, id),
      columns: { randomPlayCount: true, name: true },
    });
    if (!meme) {
      return await interaction.respondWith(
        `404 Meme not found (this should not happen)`
      );
    }
    await this.playAudio(id, interaction, meme.name);
    await db
      .update(memes)
      .set({
        randomPlayCount: meme.randomPlayCount + 1,
        // TODO: remove once this is fixed https://github.com/drizzle-team/drizzle-orm/issues/2388
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(memes.id, id));
  }

  private async playAudio(
    id: string,
    interaction: SlashInteraction<any>,
    memeName: string
  ) {
    const res = await fetch(
      `${Bun.env.BUCKET_ENDPOINT}/${Bun.env.BUCKET!}/audio/${id}.webm`
    );
    if (!res.ok) throw new Error("Cannot find meme");
    const voiceConn = await joinVoice({
      channel_id: Bun.env.CHANNEL_ID!,
      guild_id: Bun.env.GUILD_ID!,
      self_deaf: true,
      self_mute: false,
    });
    if (voiceConn) {
      await interaction.respondWith(`Playing *${memeName}*`);
      try {
        await voiceConn.playAudio(res);
      } catch (e) {
        interaction.editResponse(`Error playing *${memeName}*`);
        await logError(e);
      } finally {
        voiceConn.disconnect();
      }
    } else {
      interaction.respondWith(`Meme already playing`);
    }
  }
}
