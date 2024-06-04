import {
  ComponentInteraction,
  DiscordRestService,
  button,
  inject,
  type $slash,
} from "peach";
import type { add } from "../commands";
import { ffmpeg } from "../ffmpeg";
import ytdl from "ytdl-core";

let token = "";

export class AddController {
  private discordRestService = inject(DiscordRestService);

  async add(interaction: $slash<typeof add>) {
    const { name, url: youtubeUrl, start, end } = interaction.options;
    // const id = crypto.randomUUID();
    // const audioUrl = await this.getAudioUrl(youtubeUrl);
    // await this.downloadAudio(audioUrl, id, start, end);
    await interaction.respondWith(`Previewing *${name}*`);
    const saveBtn = button("Save").primary().customId("save");
    const skipBtn = button("Skip").secondary().customId("skip");
    await interaction.followupWith([[saveBtn, skipBtn]]);
    token = interaction.raw.token;
  }

  async save(interaction: ComponentInteraction) {
    const customId = interaction.raw.data?.custom_id;
    if (customId === "save") {
      await interaction.respondWith({ content: "Saved", components: [] });
    } else {
      await interaction.respondWith({ content: "Skipped", components: [] });
    }
    const messageId =
      interaction.raw.message?.interaction_metadata
        .original_response_message_id;
    const channelId = interaction.raw.message?.channel_id;
    await this.discordRestService.editMessage(channelId!, messageId, {
      content: "Added",
    });
  }

  private async getAudioUrl(youtubeUrl: string) {
    const info = await ytdl.getInfo(youtubeUrl, {
      requestOptions: {
        headers: {
          cookie: Bun.env.COOKIE,
        },
      },
    });
    const format = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: (format) => format.audioCodec === "opus",
    });
    return format.url;
  }

  private async downloadAudio(
    from: string,
    to: string,
    start?: string,
    end?: string
  ) {
    const args = [];
    if (start) {
      args.push("-ss", start);
    }
    if (end) {
      args.push("-to", end);
    }
    args.push("-i", from, "-c:a", "libopus", `./audio/${to}.webm`);
    await ffmpeg(...args);
  }
}
