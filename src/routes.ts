import { Route, autocompleteRoute, commandRoute } from "peach";
import { add, edit, info, list, play } from "./commands";
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
  commandRoute(edit, "tag", "add").to(EditController, "addTag"),
  commandRoute(edit, "tag", "remove").to(EditController, "removeTag"),
  commandRoute(edit, "command", "add").to(EditController, "addCommand"),
  commandRoute(edit, "command", "remove").to(EditController, "removeCommand"),
  commandRoute(edit, "rename").to(EditController, "rename"),

  // List
  commandRoute(list).to(ListController, "list"),
  autocompleteRoute(list).focus("tag").to(AutocompleteController, "tags"),
];
