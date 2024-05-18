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
  autocompleteRoute(play).focus("name").to(AutocompleteController, "name"),

  // Info
  commandRoute(info).to(InfoController, "info"),
  autocompleteRoute(info).focus("meme").to(AutocompleteController, "name"),

  // Edit
  commandRoute(addTag).to(EditController, "addTag"),
  commandRoute(removeTag).to(EditController, "removeTag"),
  commandRoute(addCommand).to(EditController, "addCommand"),
  commandRoute(removeCommand).to(EditController, "removeCommand"),
  commandRoute(rename).to(EditController, "rename"),

  // List
  commandRoute(list).to(ListController, "list"),
  autocompleteRoute(list).focus("tag").to(AutocompleteController, "tags"),
];
