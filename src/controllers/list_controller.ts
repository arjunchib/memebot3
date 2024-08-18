import type { list } from "../commands";
import { db } from "../db/database";
import { and, asc, desc, eq, gte, lt, lte } from "drizzle-orm";
import { memeTags, memes } from "../db/schema";
import type { $slash } from "peach";

interface Range {
  start: string;
  end: string;
  inclusive: boolean;
}

export class ListController {
  private interaction?: $slash<typeof list>;

  async list(interaction: $slash<typeof list>) {
    this.interaction = interaction;
    const filters = and(
      this.authorFilter(),
      this.tagFilter(),
      ...this.createdFilters(),
      ...this.durationFilters(),
      ...this.playsFilters()
    );
    const query = db
      .select({
        name: memes.name,
        duration: memes.duration,
        playCount: memes.playCount,
        createdAt: memes.createdAt,
      })
      .from(memes)
      .where(filters)
      .orderBy(this.orderBy())
      .limit(interaction.options().limit || 10);
    const filteredMemes = interaction.options().tag
      ? query.innerJoin(memeTags, eq(memes.id, memeTags.memeId)).all()
      : query.all();
    await interaction.respondWith(
      "```" +
        filteredMemes
          .map((meme) => {
            const createAt = new Intl.DateTimeFormat("en-US", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            }).format(meme.createdAt);
            return `${createAt} ${meme.duration
              .toFixed(0)
              .padStart(3)}s ${meme.playCount.toString().padStart(3)} ${
              meme.name
            }`;
          })
          .join("\n") +
        "```"
    );
  }

  private authorFilter() {
    const author = this.interaction?.options().author;
    return author ? eq(memes.authorId, author.id) : undefined;
  }

  private tagFilter() {
    const tag = this.interaction?.options().tag;
    return tag ? eq(memeTags.tagName, tag) : undefined;
  }

  private createdFilters() {
    const range = this.parseRange(this.interaction?.options().created);
    if (!range) return [];
    const filters = [];
    if (range.start) {
      filters.push(gte(memes.createdAt, new Date(range.start)));
    }
    if (range.end) {
      const end = new Date(range.end);
      if (range.inclusive) {
        filters.push(lte(memes.createdAt, end));
      } else {
        filters.push(lt(memes.createdAt, end));
      }
    }
    return filters;
  }

  private durationFilters() {
    const range = this.parseRange(this.interaction?.options().duration);
    if (!range) return [];
    const filters = [];
    if (range.start) {
      filters.push(gte(memes.duration, parseFloat(range.start)));
    }
    if (range.end) {
      const end = parseFloat(range.end);
      if (range.inclusive) {
        filters.push(lte(memes.duration, end));
      } else {
        filters.push(lt(memes.duration, end));
      }
    }
    return filters;
  }

  private playsFilters() {
    const range = this.parseRange(this.interaction?.options().plays);
    console.log(range);
    if (!range) return [];
    const filters = [];
    if (range.start) {
      filters.push(gte(memes.playCount, parseInt(range.start)));
    }
    if (range.end) {
      const end = parseInt(range.end);
      if (range.inclusive) {
        filters.push(lte(memes.duration, end));
      } else {
        filters.push(lt(memes.duration, end));
      }
    }
    return filters;
  }

  private parseRange(value?: string): Range | undefined {
    if (!value) return undefined;
    const exclusive = this.parseRangeByTerm(value, "...", false);
    if (exclusive) return exclusive;
    const inclusive = this.parseRangeByTerm(value, "..", true);
    if (inclusive) return inclusive;
    return undefined;
  }

  private parseRangeByTerm(
    value: string,
    rangeTerm: string,
    inclusive: boolean
  ): Range | undefined {
    if (!value.includes(rangeTerm)) return undefined;
    const parts = value.split(rangeTerm).map((p) => p.trim());
    return { start: parts[0], end: parts[1], inclusive };
  }

  private orderBy() {
    const sort = this.interaction?.options().sort;
    switch (sort) {
      default:
      case "newest":
        return desc(memes.createdAt);
      case "oldest":
        return asc(memes.createdAt);
      case "longest":
        return desc(memes.duration);
      case "shortest":
        return asc(memes.duration);
      case "most played":
        return desc(memes.playCount);
      case "least played":
        return asc(memes.playCount);
    }
  }
}
