export async function ffmpeg(...args: string[]) {
  const proc = Bun.spawn(["ffmpeg", "-hide_banner", "-y", ...args], {
    stderr: "pipe",
  });
  return await Bun.readableStreamToText(proc.stderr);
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

export async function ytdlp(url: string) {
  const args = [
    "yt-dlp",
    "--print",
    "webpage_url,urls",
    "-f",
    "ba*",
    "--format-sort-force",
    "hasaud,acodec:opus,aext:webm,proto:http",
    url,
  ];
  console.log(args.join(" "));
  const proc = Bun.spawn(args);
  const output = await new Response(proc.stdout).text();
  const [sourceUrl, audioUrl] = output.trim().split("\n");
  if (!sourceUrl || !audioUrl) {
    throw new Error("Could not find audio url");
  }
  return { sourceUrl, audioUrl };
}
