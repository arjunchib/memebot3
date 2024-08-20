import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export class Bucket {
  private client = new S3Client({
    endpoint: Bun.env.BUCKET_ENDPOINT!,
    region: "US",
    credentials: {
      accessKeyId: Bun.env.BUCKET_ACCESS_KEY_ID!,
      secretAccessKey: Bun.env.BUCKET_SECRET_ACCESS_KEY!,
    },
  });

  constructor(private bucket: string) {}

  async upload(file: string, data: ArrayBuffer) {
    const body = new Uint8Array(data);
    const hasher = new Bun.CryptoHasher("md5");
    hasher.update(data);
    const hash = hasher.digest("base64");
    return await this.client.send(
      new PutObjectCommand({
        Key: file,
        Bucket: this.bucket,
        Body: body,
        ACL: "public-read",
        ContentType: this.contentType(file),
        ContentMD5: hash,
      })
    );
  }

  async delete(keys: string[]) {
    const Objects = keys.map((Key) => ({ Key }));
    return await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects },
      })
    );
  }

  async listObjects() {
    const keys = [];
    let done = false;
    let continuationToken: string | undefined;
    while (!done) {
      const res = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          ContinuationToken: continuationToken,
        })
      );
      done = !res.IsTruncated;
      continuationToken = res.NextContinuationToken;
      const moreKeys =
        res.Contents?.filter((content) => content.Key).map((content) => ({
          etag: content.ETag,
          key: content.Key!,
        })) || [];
      keys.push(...moreKeys);
    }
    return keys;
  }

  private contentType(file: string) {
    if (file.endsWith(".png")) {
      return "image/png";
    } else if (file.endsWith(".webm")) {
      return "audio/webm";
    }
  }
}

export const bucket = new Bucket(Bun.env.BUCKET!);
export const oldBucket = new Bucket(Bun.env.OLD_BUCKET!);
