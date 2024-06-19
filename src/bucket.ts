import {
  ListObjectsV2Command,
  S3Client,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export class Bucket {
  private client = new S3Client({
    endpoint: Bun.env.BUCKET_ENDPOINT!,
    region: "US",
    credentials: {
      accessKeyId: Bun.env.BUCKET_ACCESS_KEY_ID!,
      secretAccessKey: Bun.env.BUCKET_SECRET_ACCESS_KEY!,
    },
  });

  async upload(file: string, stream: PutObjectCommandInput["Body"]) {
    const req = new Upload({
      client: this.client,
      params: {
        Key: file,
        Bucket: Bun.env.BUCKET,
        Body: stream,
        ACL: "public-read",
        ContentType: this.contentType(file),
      },
    });
    return req.done();
  }

  async listKeys() {
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
      continuationToken = res.ContinuationToken;
      const moreKeys =
        res.Contents?.map((content) => content.Key).filter(Boolean) || [];
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
