export async function ffmpeg(...args: string[]) {
  args = ["ffmpeg", "-hide_banner", "-y", ...args];
  log_cmd(args);
  const proc = Bun.spawn(args, { stderr: "pipe" });
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

export async function ytdlp(url: string, id: string) {
  const args = [
    "yt-dlp",
    "-f",
    "ba*",
    "--format-sort-force",
    "hasaud,acodec:opus,aext:webm,proto:http",
    url,
    "--print",
    "webpage_url,filename",
    "--no-simulate",
    "-o",
    `./audio/${id}.%(ext)s`,
  ];
  log_cmd(args);
  const proc = Bun.spawn(args);
  const output = await new Response(proc.stdout).text();
  const [sourceUrl, filename] = output.trim().split("\n");
  if (!sourceUrl || !filename) {
    throw new Error("Could not find audio url");
  }
  return { sourceUrl, filename };
}

function log_cmd(args: string[]) {
  console.log(
    [
      args[0],
      ...args.slice(1).map((arg) => (arg.startsWith("-") ? arg : `"${arg}"`)),
    ].join(" ")
  );
}
