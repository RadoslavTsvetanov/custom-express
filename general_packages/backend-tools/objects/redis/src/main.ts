// RedisObject.ts
import Docker, { Container, ContainerCreateOptions } from 'dockerode';
import Redis, { Redis as RedisClient } from 'ioredis';
import { DockerWrapper, type LifecycleHooks } from '@blazyts/objects-docker';


export class RedisObject {
  public readonly redis: IRedis;
  public readonly container?: RedisDockerContainer;

  constructor(
    schema: Record<string, {type: "string" | "number" | "boolean" | "Date" | "object" | "string[]" | "number[]" | "boolean[]" | "Date[]" | "object[]", indexed?: boolean}>, 
    config: RedisConfigSchema,
    hooks?: LifecycleHooks<any>,
    redisImpl?: IRedis,
  ) {
    if (redisImpl) {
      this.redis = redisImpl;
    } else {
      this.container = new RedisDockerContainer(config, console, hooks);
      this.redis = this.container;
    }
  }

  async run(ctx: any) {
    if (this.container) {
      return this.container.run(ctx);
    }
    return ctx;
  }

  async stop(ctx: any) {
    if (this.container) {
      return this.container.stopAndRemove(ctx);
    }
    return ctx;
  }

  createClient(): RedisClient {
    return this.redis.createClient();
  }
}



