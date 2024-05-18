import {
  slashCommand,
  string,
  user,
  number,
  subcommand,
  subcommandGroup,
} from "peach";

export const add = slashCommand("add", "adds a meme").options([
  string("url", "url to download").required(),
  string("name", "name of meme").required(),
  string("start", "start time (from beginning if omitted)"),
  string("end", "end time (to end if omitted)"),
]);

export const play = slashCommand("play", "plays a meme").options([
  string("name", "name of meme").autocomplete().required(),
]);

export const list = slashCommand("list", "list memes").options([
  user("author", "Filter by author"),
  string("tag", "Filter by tag").autocomplete(),
  string("created", 'Filter by date (ex. "3-14-2022...")'),
  string("duration", 'Filter by duration in seconds (ex. "...1.4")'),
  string("plays", 'Filter by number of plays (ex. "10..20")'),
  string("sort", "Sort by (defaults to newest)").choices([
    "newest",
    "oldest",
    "longest",
    "shortest",
    "most played",
    "least played",
  ]),
  number("limit", "Limit to display (up to 50)").minValue(1).maxValue(50),
]);

export const info = slashCommand("info", "show info about a meme").options([
  string("meme", "Name of meme").required().autocomplete(),
]);

export const addTag = subcommand("add", "Add a tag").options([
  string("meme", "Name of meme").required().autocomplete(),
  string("tag", "Tag to add").required().autocomplete(),
]);

export const removeTag = subcommand("remove", "Remove a tag").options([
  string("meme", "Name of meme").required().autocomplete(),
  string("tag", "Tag to remove").required().autocomplete(),
]);

export const addCommand = subcommand("add", "Add a command").options([
  string("meme", "Name of meme").required().autocomplete(),
  string("command", "Command to add").required().autocomplete(),
]);

export const removeCommand = subcommand("remove", "Remove a command").options([
  string("meme", "Name of meme").required().autocomplete(),
  string("command", "Command to remove").required().autocomplete(),
]);

export const rename = subcommand("rename", "Rename a meme").options([
  string("meme", "Name of meme").required().autocomplete(),
  string("tag", "Tag to add").required().autocomplete(),
]);

export const edit = slashCommand("edit", "edit a meme").options([
  subcommandGroup("tag", "Modify tags").options([addTag, removeTag]),
  subcommandGroup("command", "Modify commands").options([
    addCommand,
    removeCommand,
  ]),
  rename,
]);

export const commands = { add, play, info, list, edit };
