import {
  slashCommand,
  string,
  user,
  number,
  subcommand,
  subcommandGroup,
} from "peach";

export const add = slashCommand("add", "adds a meme", {
  options: [
    string("url", "url to download", {
      required: true,
    }),
    string("name", "name of meme", { required: true }),
    string("start", "start time (from beginning if omitted)"),
    string("end", "end time (to end if omitted)"),
  ],
});

export const play = slashCommand("play", "plays a meme", {
  options: [
    string("name", "name of meme", {
      autocomplete: true,
      required: true,
    }),
  ],
});

export const list = slashCommand("list", "list memes", {
  options: [
    user("author", "Filter by author"),
    string("tag", "Filter by tag", {
      autocomplete: true,
    }),
    string("created", 'Filter by date (ex. "3-14-2022...")'),
    string("duration", 'Filter by duration in seconds (ex. "...1.4")'),
    string("plays", 'Filter by number of plays (ex. "10..20")'),
    string("sort", "Sort by (defaults to newest)", {
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
    number("limit", "Limit to display (up to 50)", {
      minValue: 1,
      maxValue: 50,
    }),
  ],
});

export const info = slashCommand("info", "show info about a meme", {
  options: [
    string("meme", "Name of meme", { required: true, autocomplete: true }),
  ],
});

export const edit = slashCommand("edit", "edit a meme", {
  options: [
    subcommandGroup("tag", "Modify tags", {
      options: [
        subcommand("add1", "Add a tag", {
          options: [
            string("meme", "Name of meme", {
              required: true,
              autocomplete: true,
            }),
            string("tag", "Tag to add", { required: true, autocomplete: true }),
          ],
        }),
        subcommand("remove1", "Remove a tag", {
          options: [
            string("meme", "Name of meme", {
              required: true,
              autocomplete: true,
            }),
            string("tag", "Tag to remove", {
              required: true,
              autocomplete: true,
            }),
          ],
        }),
      ],
    }),
    subcommandGroup("command", "Modify commands", {
      options: [
        subcommand("add", "Add a command", {
          options: [
            string("meme", "Name of meme", {
              required: true,
              autocomplete: true,
            }),
            string("command", "Command to add", {
              required: true,
              autocomplete: true,
            }),
          ],
        }),
        subcommand("remove", "Remove a command", {
          options: [
            string("meme", "Name of meme", {
              required: true,
              autocomplete: true,
            }),
            string("command", "Command to remove", {
              required: true,
              autocomplete: true,
            }),
          ],
        }),
      ],
    }),
    subcommand("rename", "Rename a meme", {
      options: [
        string("meme", "Name of meme", {
          required: true,
          autocomplete: true,
        }),
        string("tag", "Tag to add", { required: true, autocomplete: true }),
      ],
    }),
  ],
});

export const commands = { add, play, info, list, edit };
