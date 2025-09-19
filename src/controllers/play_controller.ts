import { joinVoice, type $slash } from "peach";
import type { play, random } from "../commands";
import { db } from "../db/database";
import { eq, sql } from "drizzle-orm";
import { commands, memes, memeTags } from "../db/schema";
import type { SlashInteraction } from "peach/lib/interactions/slash_interaction";

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
    const { tag } = interaction.options();
    const memeIds = await (tag ? this.getMemesByTag(tag) : this.getAllMemes());
    const randIdx = Math.floor(Math.random() * memeIds.length);
    const id = memeIds[randIdx];
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

  private async getAllMemes() {
    const result = await db.query.memes.findMany({ columns: { id: true } });
    return result.map((m) => m.id);
  }

  private async getMemesByTag(tag: string) {
    const result = await db.query.memeTags.findMany({
      where: eq(memeTags.tagName, tag),
      columns: { memeId: true },
    });
    return result.map((mt) => mt.memeId);
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
        // await logError(e);
      } finally {
        voiceConn.disconnect();
      }
    } else {
      interaction.respondWith({
        content: `Meme already playing`,
        flags: 1 << 6,
      });
    }
  }
}
