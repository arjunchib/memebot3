import { Route } from "peach";
import { MemeController } from "./controllers/meme_controller";
import { commands } from "./commands";

export const routes: Route[] = [
  commands.slash.add.routeTo(MemeController, "add"),
  commands.slash.play.routeTo(MemeController, "play"),
];
