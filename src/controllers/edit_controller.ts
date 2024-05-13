import type { $slash } from "peach";
import type { edit } from "../commands";

export class EditController {
  addTag(interaction: $slash<typeof edit>) {}
  removeTag(interaction: $slash<typeof edit>) {}
  addCommand(interaction: $slash<typeof edit>) {}
  removeCommand(interaction: $slash<typeof edit>) {}
  rename(interaction: $slash<typeof edit>) {}
}
