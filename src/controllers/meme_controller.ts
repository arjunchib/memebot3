import { joinVoice } from "peach";
import type { Interactions } from "../commands";

export class MemeController {
  async add(interaction: Interactions["add"]) {
    const { name, url } = interaction.options;
    await interaction.respondWith(`Added ${name} with ${url}!`);
  }

  async play(interaction: Interactions["play"]) {
    await interaction.respondWith("Playing meme!");
    const voiceConn = await joinVoice({
      channel_id: Bun.env.CHANNEL_ID!,
      guild_id: Bun.env.GUILD_ID!,
      self_deaf: true,
      self_mute: false,
    });
    await voiceConn.playAudio(Bun.file("test.webm"));
    voiceConn.disconnect();
  }
}
