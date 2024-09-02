import {
  ComponentInteraction,
  DiscordRestService,
  button,
  inject,
  link,
  type $slash,
} from "peach";
import { type add } from "../commands";
import { ffprobe } from "../helpers/cli";
import { bucket } from "../services/bucket";
import { db } from "../db/database";
import { commands, memes } from "../db/schema";
import { unlink } from "fs/promises";
import { kv } from "../services/kv";
import { eq } from "drizzle-orm";
import { audioService, type LoudnormResults } from "../services/audio_service";

interface ProvisionalMeme {
  name: string;
  sourceUrl: string;
  loudness: LoudnormResults;
}

export class AddController {
  private discordRestService = inject(DiscordRestService);

  async add(interaction: $slash<typeof add>) {
    const { name, url, start, end } = interaction.options();
    const command = await db.query.commands.findFirst({
      where: eq(commands.name, name.toLowerCase()),
    });
    if (command) {
      return await interaction.respondWith({
        content: "Meme with this name already exists!",
        flags: 64,
      });
    }
    await interaction.defer();
    const { sourceUrl, id } = await audioService.download(url, { start, end });
    let loudness = await audioService.loudnorm(id);
    loudness = await audioService.loudnorm(id, loudness);
    const sourceType = this.sourceType(sourceUrl);
    let linkUrl = sourceUrl;
    if (start && sourceType === "YouTube") {
      linkUrl += `&t=${start}s`;
    }
    const sourceBtn = link(sourceType, linkUrl);
    const saveBtn = button("Save").primary().customId(`save:${id}`);
    const skipBtn = button("Skip").secondary().customId(`skip:${id}`);
    await kv.set<ProvisionalMeme>(`add:${id}`, { name, sourceUrl, loudness });
    await Promise.all([
      audioService.play(id),
      interaction.editResponse({
        content: `Previewing *${name}*`,
        components: [[sourceBtn]],
      }),
    ]);
    await interaction.followupWith({
      components: [[saveBtn, skipBtn]],
      flags: 64,
    });
  }

  async save(interaction: ComponentInteraction) {
    await interaction.respondWith({ content: "Saving...", components: [] });
    const id = this.getCustomId(interaction);
    const provisionalMeme = await kv.get<ProvisionalMeme>(`add:${id}`);
    if (!provisionalMeme) throw new Error("Cannot find meme");
    const { loudness } = provisionalMeme;
    const file = audioService.file(id);
    const normalizedFile = audioService.normalizedFile(id);
    await audioService.waveform(id);
    const waveformFile = audioService.waveformFile(id);
    const [stats, ,] = await Promise.all([
      ffprobe(file),
      bucket.upload(
        `audio/${id}.webm`,
        await Bun.file(normalizedFile).arrayBuffer()
      ),
      bucket.upload(
        `waveform/${id}.png`,
        await Bun.file(waveformFile).arrayBuffer()
      ),
    ]);
    const [meme] = await db
      .insert(memes)
      .values({
        ...provisionalMeme,
        ...stats,
        loudnessI: loudness.output_i,
        loudnessLra: loudness.output_lra,
        loudnessThresh: loudness.output_thresh,
        loudnessTp: loudness.output_tp,
        authorId: interaction.member.user.id,
        id,
      })
      .returning();
    await db.insert(commands).values([
      {
        memeId: meme.id,
        name: meme.name.toLowerCase(),
      },
    ]);
    await Promise.all([
      unlink(file),
      unlink(normalizedFile),
      unlink(waveformFile),
    ]);
    const messageId =
      interaction.message?.interaction_metadata.original_response_message_id;
    const channelId = interaction.message?.channel_id;
    await Promise.all([
      interaction.deleteResponse(),
      this.discordRestService.editMessage(channelId!, messageId, {
        content: `Added *${meme.name}*`,
      }),
    ]);
  }

  async skip(interaction: ComponentInteraction) {
    const id = this.getCustomId(interaction);
    await unlink(`./audio/${id}.webm`);
    await interaction.respondWith({ content: "Skipped", components: [] });
  }

  private getCustomId(interaction: ComponentInteraction) {
    return interaction.data.custom_id.split(":")[1];
  }

  private sourceType(url: string) {
    if (url.includes("youtube.com")) {
      return "YouTube";
    } else if (url.includes("x.com") || url.includes("twitter.com")) {
      return "X";
    } else if (url.includes("tiktok.com")) {
      return "TikTok";
    } else if (url.includes("facebook.com")) {
      return "Facebook";
    } else {
      return "Unknown";
    }
  }
}
