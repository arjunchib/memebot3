import { eq } from "drizzle-orm";
import { db } from "../db/database";
import { commands, memes } from "../db/schema";
import {
  button,
  ComponentInteraction,
  DiscordRestService,
  inject,
  type $slash,
} from "peach";
import type { dlt } from "../commands";
import { bucket } from "../services/bucket";

export class DeleteController {
  private discordRestService = inject(DiscordRestService);

  async dlt(interaction: $slash<typeof dlt>) {
    const name = interaction.options().meme;
    const command = await db.query.commands.findFirst({
      where: eq(commands.name, name),
      with: {
        meme: {
          with: {
            commands: { columns: { name: true } },
          },
          columns: { id: true, name: true },
        },
      },
    });
    const meme = command?.meme;
    if (!meme) {
      return interaction.respondWith("404 not found!");
    }
    const id = meme.id;
    await interaction.respondWith(`Deleting *${meme.name}*`);
    await interaction.followupWith({
      content: "Are you sure you want to delete this meme?",
      components: [
        [
          button("Delete").danger().customId(`delete:${id}`),
          button("Skip").secondary().customId("skip-delete"),
        ],
      ],
      flags: 64,
    });
  }

  async confirm(interaction: ComponentInteraction) {
    await interaction.respondWith({ content: "Deleting...", components: [] });
    const [, id] = interaction.data.custom_id.split(":");
    await bucket.delete([`audio/${id}.webm`, `waveform/${id}.png`]);
    const [deletedMeme] = await db
      .delete(memes)
      .where(eq(memes.id, id))
      .returning({ name: memes.name });
    const messageId =
      interaction.message?.interaction_metadata.original_response_message_id;
    const channelId = interaction.message?.channel_id;
    await Promise.all([
      interaction.deleteResponse(),
      this.discordRestService.editMessage(channelId!, messageId, {
        content: `Deleted *${deletedMeme.name}*`,
      }),
    ]);
  }

  async skip(interaction: ComponentInteraction) {
    await interaction.respondWith({ content: "Skipped", components: [] });
  }
}
