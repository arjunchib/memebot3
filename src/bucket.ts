import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
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

  async upload(
    file: string,
    data: PutObjectCommandInput["Body"],
    hash?: string
  ) {
    return await this.client.send(
      new PutObjectCommand({
        Key: file,
        Bucket: Bun.env.BUCKET,
        Body: data,
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
        Bucket: Bun.env.BUCKET,
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
          Bucket: Bun.env.BUCKET,
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

export const bucket = new Bucket();
