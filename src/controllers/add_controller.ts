import { type $slash } from "peach";
import type { add } from "../commands";

export class AddController {
  async add(interaction: $slash<typeof add>) {
    const { name, url, start, end } = interaction.options;
    await interaction.respondWith(`Added ${name} with ${url}!`);
  }
}
