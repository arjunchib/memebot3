export async function ffmpeg(...args: string[]) {
  const proc = Bun.spawn(["ffmpeg", "-hide_banner", "-y", ...args]);
  return await new Response(proc.stdout).text();
}

export async function ffprobe(...args: string[]) {
  const proc = Bun.spawn([
    "ffprobe",
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    ...args,
  ]);
  const res = JSON.parse(await new Response(proc.stdout).text())["format"];
  return {
    duration: parseFloat(res["duration"]),
    size: parseInt(res["size"]),
    bitRate: parseInt(res["bit_rate"]),
  };
}

export async function ytdlp(options: {
  url: string;
  id: string;
  start?: string;
  end?: string;
}) {
  const args = [
    "yt-dlp",
    "-f",
    "ba",
    "-S",
    "acodec:opus,aext:webm",
    "-o",
    `./audio/${options.id}.webm`,
    "--downloader-args",
    "ffmpeg:-c:a libopus",
    "--print",
    "webpage_url",
    "--no-simulate",
  ];
  if (options.start || options.end) {
    const start = options.start || "0";
    const end = options.end || "inf";
    args.push("--download-sections", `*${start}-${end}`);
  }
  args.push(options.url);
  const proc = Bun.spawn(args);
  return await new Response(proc.stdout).text();
}
