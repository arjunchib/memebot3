import { eq } from "drizzle-orm";
import { db } from "../db/database";
import { commands } from "../db/schema";
import { default as byteSize } from "byte-size";
import { DiscordRestService, inject } from "peach";
import type { EmbedAuthor } from "peach/lib/interfaces/embed";
import type { $slash } from "peach";
import type { info } from "../commands";

export class InfoController {
  private http = inject(DiscordRestService);

  async info(interaction: $slash<typeof info>) {
    const name = interaction.options().meme;
    const command = await db.query.commands.findFirst({
      where: eq(commands.name, name),
      with: {
        meme: {
          with: {
            commands: { columns: { name: true } },
            memeTags: { columns: { tagName: true } },
          },
        },
      },
    });
    const meme = command?.meme;
    if (!meme) {
      return interaction.respondWith("404 not found!");
    }
    let author: EmbedAuthor | undefined;
    if (meme.authorId) {
      const guildMember = await this.http.getGuildMember(
        Bun.env.GUILD_ID!,
        meme.authorId
      );
      const icon_url = guildMember.avatar
        ? `https://cdn.discordapp.com/guilds/${Bun.env.GUILD_ID!}/users/${
            meme.authorId
          }/avatars/${guildMember.avatar}}.png`
        : `https://cdn.discordapp.com/avatars/${meme.authorId}/${guildMember.user?.avatar}.png`;
      const name = guildMember.nick || guildMember.user?.global_name;
      if (name) {
        author = {
          icon_url,
          name,
        };
      }
    }
    const aliases = meme.commands
      .map((c) => c.name)
      .filter((c) => c !== meme.name);
    const createdAt = new Intl.DateTimeFormat("en-US").format(meme.createdAt);
    const tags = meme.memeTags.map((mt) => mt.tagName);
    const size = byteSize(meme.size, { units: "iec" });
    const bitrate = byteSize(meme.bitRate, {
      units: "bitrate",
      customUnits: {
        bitrate: [
          { from: 0, to: 1e3, unit: "bits/s" },
          { from: 1e3, to: 1e6, unit: "kbit/s" },
          { from: 1e6, to: 1e9, unit: "Mbit/s" },
          { from: 1e9, to: 1e12, unit: "Gbit/s" },
        ],
      },
    });
    const fields = [
      {
        name: "plays",
        value: meme.playCount.toString(),
        inline: true,
      },
      {
        name: "created at",
        value: createdAt,
        inline: true,
      },
      {
        name: "duration",
        value: `${meme.duration.toFixed(1)}s`,
        inline: true,
      },
      {
        name: "tags",
        value: tags.join(", "),
        inline: true,
      },
      {
        name: "size",
        value: `${size.value} ${size.unit}`,
        inline: true,
      },
      {
        name: "bitrate",
        value: `${bitrate.value} ${bitrate.unit}`,
        inline: true,
      },
    ];
    await interaction.respondWith({
      embeds: [
        {
          author,
          title: meme.name,
          description: aliases.join(", "),
          fields,
          color: (247 << 16) + (212 << 8) + 87,
          image: {
            url: `${Bun.env.BUCKET!}/waveforms/${meme.id}.png`,
          },
          footer: {
            text: meme.id,
          },
        },
      ],
    });
  }
}
