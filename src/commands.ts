import {
  slashCommand,
  string,
  createCommands,
  type inferInteraction,
  user,
  number,
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
          required: true,
        }),
        other: string("test"),
      },
    }),
    list: slashCommand({
      description: "list memes",
      options: {
        author: user("Filter by author"),
        tag: string("Filter by tag", {
          autocomplete: true,
        }),
        created: string('Filter by date (ex. "3-14-2022...")'),
        duration: string('Filter by duration in seconds (ex. "...1.4")'),
        plays: string('Filter by number of plays (ex. "10..20")'),
        sort: string("Sort by (defaults to newest)", {
          choices: [
            {
              name: "newest",
              value: "newest",
            },
            {
              name: "oldest",
              value: "oldest",
            },
            {
              name: "longest",
              value: "longest",
            },
            {
              name: "shortest",
              value: "shortest",
            },

            {
              name: "most played",
              value: "most_played",
            },
            {
              name: "least played",
              value: "least_played",
            },
          ],
        }),
        limit: number("Limit to display (up to 50)", {
          minValue: 1,
          maxValue: 50,
        }),
      },
    }),
  },
  user: {},
  message: {},
});

export type Interactions = inferInteraction<typeof commands>;
