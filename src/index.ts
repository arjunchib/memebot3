import { bootstrap } from "peach";
import { commands } from "./commands";
import { routes } from "./routes";
import { mkdirSync } from "fs";

try {
  mkdirSync("audio");
} catch {}

await bootstrap({
  applicationId: Bun.env.APPLICATION_ID!,
  token: Bun.env.TOKEN!,
  commands,
  routes,
  debug: true,
  syncCommands: {
    guildId: Bun.env.GUILD_ID!,
  },
  intents: 1 << 7,
});
