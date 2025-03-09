import { type $slash } from "peach";
import type { sql } from "../commands";
import { sqliteReadonly } from "../db/database";

export class SqlController {
  async sql(interaction: $slash<typeof sql>) {
    const { query } = interaction.options();
    try {
      const results = sqliteReadonly.query(query).all();
      if (results.length === 0) {
        await interaction.respondWith("```No results!```");
      } else {
        await interaction.respondWith(
          {
            attachments: [
              {
                id: 0 as unknown as string,
                content_type: "application/json",
                filename: `${interaction.id}.json`,
                ephemeral: true,
              },
            ],
          },
          [[JSON.stringify(results, null, 2)]]
        );
      }
    } catch (e: any) {
      await interaction.respondWith(`\`\`\`${e.toString()}\`\`\``);
    }
  }
}
