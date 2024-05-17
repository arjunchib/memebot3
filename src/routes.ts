import { Route, autocompleteRoute, commandRoute } from "peach";
import { MemeController } from "./controllers/meme_controller";
import { add, edit, info, list, play } from "./commands";
import { ListController } from "./controllers/list_controller";
import { InfoController } from "./controllers/info_controller";
import { EditController } from "./controllers/edit_controller";

export const routes: Route[] = [
  commandRoute(add).to(MemeController, "add"),
  commandRoute(play).to(MemeController, "play"),
  commandRoute(list).to(ListController, "list"),
  commandRoute(info).to(InfoController, "info"),

  commandRoute(edit, "tag", "add").to(EditController, "addTag"),
  commandRoute(edit, "tag", "remove").to(EditController, "removeTag"),
  commandRoute(edit, "command", "add").to(EditController, "addCommand"),
  commandRoute(edit, "command", "remove").to(EditController, "removeCommand"),
  commandRoute(edit, "rename").to(EditController, "rename"),

  autocompleteRoute(play).to(MemeController, "autocompleteName"),
  autocompleteRoute(list).to(ListController, "list"),
  autocompleteRoute(info).to(MemeController, "autocompleteName"),
];
