import {
  startOfDay,
  startOfHour,
  startOfMinute,
  startOfToday,
  startOfTomorrow,
  startOfWeek,
  startOfYear,
  startOfYesterday,
  sub,
} from "date-fns";
import wordsToNumbers from "words-to-numbers";

export function parseDate(value: string) {
  return (
    parseOneOff(value) ||
    parseThisX(value) ||
    parseRelative(value) ||
    new Date(value)
  );
}

function parseOneOff(value: string) {
  if (value === "today") {
    return startOfToday();
  } else if (value === "tomorrow") {
    return startOfTomorrow();
  } else if (value === "yesterday") {
    return startOfYesterday();
  }
}

function parseRelative(value: string) {
  const matches =
    /(?<quantity>.*?)(?<unit> years?| months?| weeks?| days?| hours?| minutes?| seconds?)(?<dir>.*?)/.exec(
      value
    );
  if (matches && matches.groups) {
    const quantity = parseQuantity(matches.groups["quantity"].trim());
    const unit = parseUnit(matches.groups["unit"].trim());
    return sub(new Date(), { [unit]: quantity });
  }
}

function parseThisX(value: string) {
  const matches =
    /(?<quantity>this|last) (?<unit>year|month|week|day|hour|minute)/.exec(
      value
    );
  if (matches && matches.groups) {
    const { quantity, unit } = matches.groups;
    switch (unit) {
      case "year":
        return startOfYear(startOf(quantity, unit));
      case "month":
        return startOfMinute(startOf(quantity, unit));
      case "week":
        return startOfWeek(startOf(quantity, unit));
      case "day":
        return startOfDay(startOf(quantity, unit));
      case "hour":
        return startOfHour(startOf(quantity, unit));
      case "minute":
        return startOfMinute(startOf(quantity, unit));
    }
  }
}

function startOf(quantity: string, unit: string) {
  return quantity === "last"
    ? sub(new Date(), { [unit + "s"]: 1 })
    : new Date();
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
