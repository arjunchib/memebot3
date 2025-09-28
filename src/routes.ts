import { Route, autocompleteRoute, commandRoute, customIdRoute } from "peach";
import {
  add,
  addCommand,
  addTag,
  dlt,
  info,
  list,
  listTags,
  play,
  random,
  removeCommand,
  removeTag,
  rename,
  sql,
} from "./commands";
import { ListController } from "./controllers/list_controller";
import { InfoController } from "./controllers/info_controller";
import { EditController } from "./controllers/edit_controller";
import { AddController } from "./controllers/add_controller";
import { PlayController } from "./controllers/play_controller";
import { AutocompleteController } from "./controllers/autocomplete_controller";
import { DeleteController } from "./controllers/delete_controller";
import { SqlController } from "./controllers/sql_controller";
import { TagController } from "./controllers/tag_controller";

export const routes: Route[] = [
  // Add
  commandRoute(add).to(AddController, "add"),
  customIdRoute(/^save:/).to(AddController, "save"),
  customIdRoute(/^skip:/).to(AddController, "skip"),

  // Play
  commandRoute(play).to(PlayController, "play"),
  autocompleteRoute(play).focus("meme").to(AutocompleteController, "meme"),

  // Random
  commandRoute(random).to(PlayController, "random"),
  autocompleteRoute(random).focus("tag").to(AutocompleteController, "tag"),

  // Info
  commandRoute(info).to(InfoController, "info"),
  autocompleteRoute(info).focus("meme").to(AutocompleteController, "meme"),

  // Tags add
  commandRoute(addTag).to(TagController, "addTag"),
  autocompleteRoute(addTag).focus("meme").to(AutocompleteController, "meme"),
  autocompleteRoute(addTag).focus("tag").to(AutocompleteController, "tag"),

  // Tags remove
  commandRoute(removeTag).to(TagController, "removeTag"),
  autocompleteRoute(removeTag).focus("meme").to(AutocompleteController, "meme"),
  autocompleteRoute(removeTag)
    .focus("tag")
    .to(TagController, "removeTagAutocomplete"),

  // Tags list
  commandRoute(listTags).to(TagController, "listTags"),

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

  // Delete
  commandRoute(dlt).to(DeleteController, "dlt"),
  autocompleteRoute(dlt).focus("meme").to(AutocompleteController, "meme"),
  customIdRoute(/^delete:/).to(DeleteController, "confirm"),
  customIdRoute("skip-delete").to(DeleteController, "skip"),

  // SQL
  commandRoute(sql).to(SqlController, "sql"),
];
