import { db } from "./database";
import { dbLegacy } from "../legacy-db/database";
import { commands, memeTags, memes, tags } from "./schema";
import { bucket, oldBucket } from "../bucket";
import { Pool } from "../pool";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

console.log("Migrating db");
migrate(db, { migrationsFolder: "drizzle" });

console.log("Getting objects");
const bucketObjects = await bucket.listObjects();
const oldBucketObjects = await oldBucket.listObjects();
let totalUploaded = 0;

async function syncMemes() {
  console.log("Syncing memes");
  const myMemes = await dbLegacy.query.memes.findMany();
  await db.delete(memes);
  await db.insert(memes).values(
    myMemes.map((meme) => {
      if (meme.duration == null) throw new Error("Missing duration");
      if (meme.size == null) throw new Error("Missing size");
      if (meme.bitRate == null) throw new Error("Missing bitRate");
      if (meme.loudnessI == null) throw new Error("Missing loudnessI");
      if (meme.loudnessLra == null) throw new Error("Missing loudnessLra");
      if (meme.loudnessThresh == null)
        throw new Error("Missing loudnessThresh");
      if (meme.loudnessTp == null) throw new Error("Missing loudnessTp");
      return {
        id: meme.id,
        name: meme.name,
        createdAt: new Date(meme.createdAt),
        updatedAt: new Date(meme.updatedAt),
        duration: meme.duration,
        size: meme.size,
        bitRate: meme.bitRate,
        loudnessI: meme.loudnessI,
        loudnessLra: meme.loudnessLra,
        loudnessThresh: meme.loudnessThresh,
        loudnessTp: meme.loudnessTp,
        authorId: meme.authorId,
        playCount: meme.playCount,
        randomPlayCount: meme.randomPlayCount,
      };
    })
  );
  console.log(await db.query.memes.findFirst());
}

async function syncCommands() {
  console.log("Syncing commands");
  const myCommands = await dbLegacy.query.commands.findMany();
  await db.delete(commands);
  await db.insert(commands).values(
    myCommands.map((command) => {
      if (command.memeId == null) throw new Error("Missing memeId");
      if (typeof command.memeId !== "string")
        throw new Error("Wrong type memeId");
      return {
        name: command.name,
        memeId: command.memeId as unknown as string,
        createdAt: new Date(command.createdAt),
        updatedAt: new Date(command.updatedAt),
      };
    })
  );
  console.log(await db.query.commands.findFirst());
}

async function syncTags() {
  console.log("Syncing tags");
  const myTags = await dbLegacy.query.tags.findMany();
  await db.delete(tags);
  await db.insert(tags).values(
    myTags.map((tag) => {
      return {
        name: tag.name,
        createdAt: new Date(tag.createdAt),
        updatedAt: new Date(tag.updatedAt),
      };
    })
  );
  console.log(await db.query.tags.findFirst());
}

async function syncMemeTags() {
  console.log("Syncing meme_tags");
  const myMemeTags = await dbLegacy.query.memeTags.findMany();
  await db.delete(memeTags);
  await db.insert(memeTags).values(
    myMemeTags.map((memeTag) => {
      if (memeTag.memeId == null) throw new Error("Missing memeId");
      if (typeof memeTag.memeId !== "string")
        throw new Error("Wrong type memeId");
      return {
        memeId: memeTag.memeId,
        tagName: memeTag.tagName,
        createdAt: new Date(memeTag.createdAt),
        updatedAt: new Date(memeTag.updatedAt),
      };
    })
  );
  console.log(await db.query.memeTags.findFirst());
}

async function syncObjects() {
  console.log("Syncing bucket objects");
  const myMemes = await db.query.memes.findMany({
    columns: { id: true },
  });
  const keys = myMemes.flatMap((meme) => [
    [`audio/${meme.id}.webm`, `audio/${meme.id}.webm`] as [string, string],
    [`waveforms/${meme.id}.png`, `waveform/${meme.id}.png`] as [string, string],
  ]);
  const allowedKeys = keys.map((key) => key[1]);
  const keysToRemove = bucketObjects
    .filter((obj) => !allowedKeys.includes(obj.key))
    .map((obj) => obj.key);
  if (keysToRemove.length > 0) {
    const deleteRes = await bucket.delete(keysToRemove);
    console.log(
      `Deleted ${deleteRes.Deleted?.length ?? 0} objects out of ${
        keysToRemove.length
      }`
    );
  } else {
    console.log("Nothing to delete");
  }
  const tasks = myMemes.flatMap((meme) => [
    syncObject(`audio/${meme.id}.webm`, `audio/${meme.id}.webm`),
    syncObject(`waveforms/${meme.id}.png`, `waveform/${meme.id}.png`),
  ]);
  const pool = new Pool(tasks);
  await pool.concurrent(8);
  console.log(`\nUploaded ${totalUploaded} objects of ${tasks.length}`);
}

function syncObject(oldFile: string, newFile: string) {
  return async () => {
    const oldObject = oldBucketObjects.find((obj) => obj.key === oldFile);
    const newObject = bucketObjects.find((obj) => obj.key === newFile);
    if (!newObject || oldObject?.etag !== newObject.etag) {
      await uploadObject(oldFile, newFile);
      console.write(newObject ? "o" : "x");
    } else {
      console.write(".");
    }
  };
}

async function uploadObject(oldFile: string, newFile: string) {
  const res = await fetch(
    `${Bun.env.BUCKET_ENDPOINT}/${Bun.env.OLD_BUCKET!}/${oldFile}`
  );
  const data = await res.arrayBuffer();
  const hasher = new Bun.CryptoHasher("md5");
  hasher.update(data);
  const md5Hash = hasher.digest("base64");
  await bucket.upload(newFile, new Uint8Array(data), md5Hash);
  totalUploaded++;
}

await syncMemes();
await syncCommands();
await syncTags();
await syncMemeTags();
await syncObjects();
