import { bootstrap } from "peach";
import { commands } from "./commands";
import { routes } from "./routes";

await bootstrap({
  applicationId: Bun.env.APPLICATION_ID!,
  token: Bun.env.TOKEN!,
  commands,
  routes,
  debug: true,
  syncCommands: {
    guildId: Bun.env.GUILD_ID!,
  },
});
