import { Route } from "peach";
import { MemeController } from "./controllers/meme_controller";
import { commands } from "./commands";
import { ListController } from "./controllers/list_controller";
import { InfoController } from "./controllers/info_controller";

export const routes: Route[] = [
  commands.slash.add.routeTo(MemeController, "add"),
  commands.slash.play.routeTo(MemeController, "play"),
  commands.slash.play.autocomplete.routeTo(MemeController, "autocompleteName"),
  commands.slash.list.routeTo(ListController, "list"),
  commands.slash.list.autocomplete.routeTo(ListController, "listAutocomplete"),
  commands.slash.info.routeTo(InfoController, "info"),
  commands.slash.info.autocomplete.routeTo(MemeController, "autocompleteName"),
];
