import {
  slashCommand,
  string,
  type InteractionTypes,
  createCommands,
} from "peach";

export const commands = createCommands({
  slash: {
    add: slashCommand({
      description: "adds a meme",
      options: {
        url: string("URL to download", { required: true }),
        name: string("name of meme", { required: true }),
      },
    }),
    play: slashCommand({
      description: "plays a meme",
      options: {
        name: string("name of meme"),
      },
    }),
  },
  user: {},
  message: {},
});

export type Interactions = InteractionTypes<typeof commands>;
