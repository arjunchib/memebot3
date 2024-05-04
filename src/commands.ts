import {
  slashCommand,
  string,
  createCommands,
  type inferInteraction,
} from "peach";

export const commands = createCommands({
  slash: {
    add: slashCommand({
      description: "adds a meme",
      options: {
        url: string("url to download", { required: true }),
        name: string("name of meme", { required: true }),
        start: string("start time (from beginning if omitted)"),
        end: string("end time (to end if omitted)"),
      },
    }),
    play: slashCommand({
      description: "plays a meme",
      options: {
        name: string("name of meme", {
          autocomplete: true,
          // required: true,
        }),
      },
    }),
  },
  user: {},
  message: {},
});

export type Interactions = inferInteraction<typeof commands>;
