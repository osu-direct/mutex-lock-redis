export type MutexOptions = {
  redis: {
    host: string;
    port: number;
  };
  mutex?: {
    checkInterval?: number;
    ttl: number;
  };
};
