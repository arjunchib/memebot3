import { Route, autocompleteRoute, commandRoute } from "peach";
import {
  add,
  addCommand,
  addTag,
  info,
  list,
  play,
  removeCommand,
  removeTag,
  rename,
} from "./commands";
import { ListController } from "./controllers/list_controller";
import { InfoController } from "./controllers/info_controller";
import { EditController } from "./controllers/edit_controller";
import { AddController } from "./controllers/add_controller";
import { PlayController } from "./controllers/play_controller";
import { AutocompleteController } from "./controllers/autocomplete_controller";

export const routes: Route[] = [
  // Add
  commandRoute(add).to(AddController, "add"),

  // Play
  commandRoute(play).to(PlayController, "play"),
  autocompleteRoute(play).focus("name").to(AutocompleteController, "meme"),

  // Info
  commandRoute(info).to(InfoController, "info"),
  autocompleteRoute(info).focus("meme").to(AutocompleteController, "meme"),

  // Edit tags add
  commandRoute(addTag).to(EditController, "addTag"),
  autocompleteRoute(addTag).focus("meme").to(AutocompleteController, "meme"),
  autocompleteRoute(addTag).focus("tag").to(AutocompleteController, "tag"),

  // Edit tags remove
  commandRoute(removeTag).to(EditController, "removeTag"),
  autocompleteRoute(removeTag).focus("meme").to(AutocompleteController, "meme"),
  autocompleteRoute(removeTag)
    .focus("tag")
    .to(EditController, "removeTagAutocomplete"),

  // Edit commands add
  commandRoute(addCommand).to(EditController, "addCommand"),
  autocompleteRoute(addCommand)
    .focus("meme")
    .to(AutocompleteController, "meme"),

  // Edit commands remove
  commandRoute(removeCommand).to(EditController, "removeCommand"),
  autocompleteRoute(removeCommand)
    .focus("meme")
    .to(AutocompleteController, "meme"),
  autocompleteRoute(removeCommand)
    .focus("command")
    .to(EditController, "removeCommandAutocomplete"),

  // Edit rename
  commandRoute(rename).to(EditController, "rename"),
  autocompleteRoute(rename).focus("meme").to(AutocompleteController, "meme"),

  // List
  commandRoute(list).to(ListController, "list"),
  autocompleteRoute(list).focus("tag").to(AutocompleteController, "tag"),
];
