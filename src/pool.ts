type Task<T> = (index: number) => Promise<T>;

export class Pool<T> {
  private tasks: Task<T>[];

  constructor(iterable?: Iterable<Task<T>>) {
    this.tasks = iterable ? [...iterable] : [];
  }

  add(...tasks: Task<T>[]) {
    this.tasks.push(...tasks);
  }

  async concurrent(concurrency = 4): Promise<T[]> {
    const results: T[] = [];
    const take = async (task: Task<T> | undefined, index: number) => {
      if (task) {
        results.push(await task(index));
        await take(this.tasks.pop(), index);
      }
    };
    await Promise.all(this.tasks.splice(-concurrency, concurrency).map(take));
    return results;
  }
}
