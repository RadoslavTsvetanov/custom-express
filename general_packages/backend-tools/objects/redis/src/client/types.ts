import RedisClient from "ioredis";

export interface IRedis {
  createClient(): RedisClient;// should return a new connection each time it is called
}

export interface RedisConfigSchema {
  /**
   * Redis server hostname
   * @default 'localhost'
   */
  host?: string;
  
  /**
   * Redis server port
   * @default 6379
   */
  port?: number;
  
  /**
   * Redis server password (optional)
   */
  password?: string;
  
  /**
   * Custom Redis Docker image
   * @default 'redis:7'
   */
  image?: string;
  
  /**
   * Container name
   * @default 'redis-server'
   */
  name?: string;
  
  /**
   * Enable persistent storage
   * @default false
   */
  persistent?: boolean;
  
  /**
   * Skip container creation
   * @default false
   */
  noCreate?: boolean;
}