# memebot

## Getting started

Prerequisites:

1. Install [ffmpeg](https://www.ffmpeg.org/download.html)
2. Install [yt-dlp](https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#installation)
3. Copy `.env.example` to `.env` and fill out the values

```bash
bun install
```

```bash
bun start
```

## Seed from legacy db

1. Copy the `memebot.sqlite` file from the old memebot into this project as `memebot-legacy.sqlite`
2. Set the old s3 bucket url via the `OLD_BUCKET` env var

Then you can run the seed with:

```bash
bun run seed
```

## Release

Force CI 4
