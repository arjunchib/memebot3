import { Route } from "peach";
import { MemeController } from "./controllers/meme_controller";
import { commands } from "./commands";
import { ListController } from "./controllers/list_controller";

export const routes: Route[] = [
  commands.slash.add.routeTo(MemeController, "add"),
  commands.slash.play.routeTo(MemeController, "play"),
  commands.slash.play.autocomplete.routeTo(MemeController, "autocompletePlay"),
  commands.slash.list.routeTo(ListController, "list"),
  commands.slash.list.autocomplete.routeTo(ListController, "listAutocomplete"),
];
