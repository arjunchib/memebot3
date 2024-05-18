import type { $slash } from "peach";
import type {
  addCommand,
  addTag,
  edit,
  removeCommand,
  removeTag,
  rename,
} from "../commands";

export class EditController {
  addTag(interaction: $slash<typeof addTag>) {}
  removeTag(interaction: $slash<typeof removeTag>) {}
  addCommand(interaction: $slash<typeof addCommand>) {}
  removeCommand(interaction: $slash<typeof removeCommand>) {}
  rename(interaction: $slash<typeof rename>) {}
}
