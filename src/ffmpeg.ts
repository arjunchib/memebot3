export async function ffmpeg(...args: string[]) {
  const proc = Bun.spawn(["ffmpeg", "-hide_banner", "-y", ...args]);
  return await new Response(proc.stdout).text();
}
