import { sub } from "date-fns";
import wordsToNumbers from "words-to-numbers";

export function parseDate(value: string) {
  const result =
    /(?<quantity>.*?)(?<unit> years?| months?| weeks?| days?| hours?| minutes?| seconds?)(?<dir>.*?)/.exec(
      value
    );
  if (result && result.groups) {
    const quantity = parseQuantity(result.groups["quantity"].trim());
    const unit = parseUnit(result.groups["unit"].trim());
    console.log({ quantity, unit });
    return sub(new Date(), { [unit]: quantity });
  } else {
    return new Date(value);
  }
}

function parseQuantity(value: string) {
  if (value === "a" || value === "an") return 1;

  const int = parseInt(value);
  if (!Number.isNaN(int)) return int;

  const num = wordsToNumbers(value);
  if (typeof num === "number") return num;

  return 0;
}

function parseUnit(value: string) {
  if (!value.endsWith("s")) {
    return value + "s";
  } else {
    return value;
  }
}
