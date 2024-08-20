import { joinVoice } from "peach";
import { ffmpeg, ytdlp } from "../helpers/cli";

interface LoudnormResults {
  input_i: number;
  input_lra: number;
  input_tp: number;
  input_thresh: number;
  output_i: number;
  output_tp: number;
  output_lra: number;
  output_thresh: number;
  normalization_type: string;
  target_offset: number;
}

export class AudioService {
  async play(id: string) {
    const voiceConn = await joinVoice({
      channel_id: Bun.env.CHANNEL_ID!,
      guild_id: Bun.env.GUILD_ID!,
      self_deaf: true,
      self_mute: false,
    });
    await voiceConn.playAudio(Bun.file(this.file(id)));
    voiceConn.disconnect();
  }

  async download(
    url: string,
    options?: {
      start?: string;
      end?: string;
    }
  ) {
    const { sourceUrl, audioUrl } = await ytdlp(url);
    const id = crypto.randomUUID();
    const ffmpegArgs = [];
    if (options?.start) {
      ffmpegArgs.push("-ss", options.start);
    }
    if (options?.end) {
      ffmpegArgs.push("-to", options.end);
    }
    ffmpegArgs.push("-i", audioUrl, "-c:a", "libopus", "-vn", this.file(id));
    await ffmpeg(...ffmpegArgs);
    return { sourceUrl, audioUrl, id };
  }

  async loudnorm(
    id: string,
    loudness?: LoudnormResults
  ): Promise<LoudnormResults> {
    // Build command
    let cmd = ["-i", this.file(id)];

    // Build filter
    let filter = "loudnorm=I=-23:LRA=7:tp=-2";
    if (loudness) {
      filter += `:measured_I=${loudness.input_i}:measured_LRA=${loudness.input_lra}:measured_tp=${loudness.input_tp}:measured_thresh=${loudness.input_thresh}`;
    }
    filter += ":print_format=json";
    cmd.push("-af", filter);

    // Add options
    if (loudness) {
      cmd.push(this.normalizedFile(id));
    } else {
      cmd.push("-f", "null", "-");
    }

    // Run
    const result = await ffmpeg(...cmd);

    // Parse results
    const loudnormStr = result.match(/{[\s\S]*}/)?.[0];
    if (!loudnormStr) throw new Error("Could not parse results");
    const loudnorm = JSON.parse(loudnormStr);
    for (const field in loudnorm) {
      if (field !== "normalization_type") {
        loudnorm[field] = Number(loudnorm[field]);
      }
    }
    return loudnorm;
  }

  async waveform(id: string) {
    return await ffmpeg(
      "-i",
      this.normalizedFile(id),
      "-filter_complex",
      "compand,showwavespic=s=512x128:colors=white",
      "-frames:v",
      "1",
      "-c:v",
      "png",
      "-f",
      "image2",
      this.waveformFile(id)
    );
  }

  file(id: string) {
    return `./audio/${id}.webm`;
  }

  normalizedFile(id: string) {
    return `./audio/${id}-normalized.webm`;
  }

  waveformFile(id: string) {
    return `./waveform/${id}.png`;
  }
}

export const audioService = new AudioService();
