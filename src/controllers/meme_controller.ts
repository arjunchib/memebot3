import type { Interactions } from "../commands";

export class MemeController {
  async add(interaction: Interactions["add"]) {
    const { name, url } = interaction.options;
    await interaction.respondWith(`Added ${name} with ${url}!`);
  }

  play(interaction: Interactions["play"]) {}
}
