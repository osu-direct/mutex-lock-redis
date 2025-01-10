import { test } from "bun:test";
import { MutexLock } from "../src/MutexLock";

test(
	"redis mutex",
	async () => {
		const mutexLock = await MutexLock.create({
			redis: {
				host: "127.0.0.1",
				port: 6379,
			},
		});

		const testLock = async () => {
			const release = await mutexLock.obtainLock("test");
			console.log("got lock");
			try {
				await new Promise((res) => setTimeout(res, 3000));
			} finally {
				await release();
				console.log("released lock");
			}
		};

		await Promise.all([testLock(), testLock(), testLock(), testLock()]);
	},
	{
		timeout: Number.POSITIVE_INFINITY,
	},
);
