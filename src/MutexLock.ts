import type { MutexOptions } from "./types";
import redis from "redis";

type RedisClient = redis.RedisClientType<
	redis.RedisDefaultModules & redis.RedisModules,
	redis.RedisFunctions,
	redis.RedisScripts
>;

export class MutexLock {
	redisClient: RedisClient;
	mutexOptions: MutexOptions | undefined;

	constructor(redisClient: RedisClient, options?: MutexOptions) {
		this.mutexOptions = options;
		this.redisClient = redisClient;
	}

	static async create(options?: MutexOptions) {
		const redisClient = await redis
			.createClient({
				url: `redis://${options?.redis?.host ?? "127.0.0.1"}:${options?.redis?.port ?? 6379}`,
			})
			.connect();

		return new MutexLock(redisClient, options);
	}

	async obtainLock(lockName: string) {
		const lockIdentifier = `mutexlock:${lockName}`;
		const releaseFunc = async () => {
			await this.redisClient.del(lockIdentifier);
		};

		let ttl = this.mutexOptions?.mutex?.ttl || 60;
		if (ttl <= 0) ttl = 60;

		while (true) {
			const acquired = await this.redisClient.set(lockIdentifier, "1", {
				NX: true,
				EX: ttl,
			});

			if (acquired) {
				return releaseFunc;
			}
			await new Promise((resolve) =>
				setTimeout(resolve, this.mutexOptions?.mutex?.checkInterval || 100),
			);
		}
	}
}
