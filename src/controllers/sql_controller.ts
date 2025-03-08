import { type $slash } from "peach";
import type { sql } from "../commands";
import { sqliteReadonly } from "../db/database";

export class SqlController {
  async sql(interaction: $slash<typeof sql>) {
    const { query } = interaction.options();
    let output: string;
    try {
      const results = sqliteReadonly.query(query).all();
      output = results
        .map((result) => JSON.stringify(result as any, null, 2))
        .join("\n");
    } catch (e: any) {
      output = e.toString();
    }
    await interaction.respondWith(`\`\`\`
${output.trim().slice(0, 2000 - 8)}
\`\`\``);
  }
}
