import {
  ComponentInteraction,
  DiscordRestService,
  button,
  inject,
  joinVoice,
  link,
  type $slash,
} from "peach";
import { type add } from "../commands";
import { ffmpeg, ffprobe, ytdlp } from "../cli";
import { bucket } from "../bucket";
import { db } from "../db/database";
import { commands, memes } from "../db/schema";
import { unlink } from "fs/promises";
import { kv } from "../kv";
import { eq } from "drizzle-orm";

interface ProvisionalMeme {
  name: string;
  sourceUrl: string;
}

interface LoudnormResults {
  input_i: number;
  input_lra: number;
  input_tp: number;
  input_thresh: number;
  output_i: number;
  output_tp: number;
  output_lra: number;
  output_thresh: number;
  normalization_type: string;
  target_offset: number;
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
    const id = crypto.randomUUID();
    const downloadVideoPromise = ytdlp({ url, id, start, end });
    await interaction.defer();
    const { sourceUrl, startTime } = await downloadVideoPromise;
    const youtubeBtn = link(
      "YouTube",
      `${sourceUrl}&t=${Math.floor(startTime)}s`
    );
    const saveBtn = button("Save").primary().customId(`save:${id}`);
    const skipBtn = button("Skip").secondary().customId(`skip:${id}`);
    await kv.set(`add:${id}`, { name, sourceUrl });
    await Promise.all([
      this.play(id),
      interaction.editResponse({
        content: `Previewing *${name}*`,
        components: [[youtubeBtn]],
      }),
    ]);
    await interaction.followupWith([[saveBtn, skipBtn]]);
  }

  private async play(id: string) {
    const voiceConn = await joinVoice({
      channel_id: Bun.env.CHANNEL_ID!,
      guild_id: Bun.env.GUILD_ID!,
      self_deaf: true,
      self_mute: false,
    });
    await voiceConn.playAudio(Bun.file(`./audio/${id}.webm`));
    voiceConn.disconnect();
  }

  async save(interaction: ComponentInteraction) {
    await interaction.respondWith({ content: "Saving", components: [] });
    const id = this.getCustomId(interaction);
    const provisionalMeme = await kv.get<ProvisionalMeme>(`add:${id}`);
    if (!provisionalMeme) throw new Error("Cannot find meme");
    const file = `./audio/${id}.webm`;
    const normalizedFile = `./audio/${id}-normalized.webm`;
    let loudness = await this.loudnorm(file);
    loudness = await this.loudnorm(file, normalizedFile, loudness);
    await bucket.upload(`audio/${id}.webm`, Bun.file(normalizedFile));
    const stats = await ffprobe(file);
    const [meme] = await db
      .insert(memes)
      .values({
        ...provisionalMeme,
        ...stats,
        loudnessI: loudness.output_i,
        loudnessLra: loudness.output_lra,
        loudnessThresh: loudness.output_thresh,
        loudnessTp: loudness.output_tp,
      })
      .returning();
    await db.insert(commands).values([
      {
        memeId: meme.id,
        name: meme.name.toLowerCase(),
      },
    ]);
    await unlink(file);
    await unlink(normalizedFile);
    await interaction.deleteResponse();
    const messageId =
      interaction.message?.interaction_metadata.original_response_message_id;
    const channelId = interaction.message?.channel_id;
    await this.discordRestService.editMessage(channelId!, messageId, {
      content: `Added *${meme.name}*`,
    });
  }

  async skip(interaction: ComponentInteraction) {
    const id = this.getCustomId(interaction);
    await unlink(`./audio/${id}.webm`);
    await interaction.respondWith({ content: "Skipped", components: [] });
  }

  private getCustomId(interaction: ComponentInteraction) {
    return interaction.data.custom_id.split(":")[1];
  }

  private async loudnorm(
    inputFile: string,
    outputFile?: string,
    loudness?: LoudnormResults
  ): Promise<LoudnormResults> {
    // Build command
    let cmd = ["-i", inputFile];

    // Build filter
    let filter = "loudnorm=I=-23:LRA=7:tp=-2";
    if (loudness) {
      filter += `:measured_I=${loudness.input_i}:measured_LRA=${loudness.input_lra}:measured_tp=${loudness.input_tp}:measured_thresh=${loudness.input_thresh}`;
    }
    filter += ":print_format=json";
    cmd.push("-af", filter);

    // Add options
    if (outputFile) {
      cmd.push(outputFile);
    } else {
      cmd.push("-f", "null", "-");
    }

    // Run
    const result = await ffmpeg(...cmd);

    // Parse results
    const loudnormStr = result.match(/{[\s\S]*}/)?.[0];
    if (!loudnormStr) throw new Error("Could not parse results");
    const loudnorm = JSON.parse(loudnormStr);
    for (const field in loudnorm) {
      if (field !== "normalization_type") {
        loudnorm[field] = Number(loudnorm[field]);
      }
    }
    return loudnorm;
  }
}
