import { eq } from "drizzle-orm";
import { db } from "./db/database";
import { keyValue } from "./db/schema";

class KV {
  async set<T>(key: string, value: T) {
    return await db.insert(keyValue).values({ key, value });
  }

  async get<T>(key: string): Promise<T | undefined> {
    const result = await db.query.keyValue.findFirst({
      where: eq(keyValue.key, key),
    });
    if (result) {
      return result.value as T;
    }
  }
}

export const kv = new KV();
