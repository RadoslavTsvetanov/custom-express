import { DockerWrapper } from "@blazyts/objects-docker";

export class RedisDockerContainer extends DockerWrapper implements IRedis {
  private redisOptions: {
    host: string;
    port: number;
    password?: string;
  };

  private readonly shouldCreate: boolean;

  constructor(config: RedisConfigSchema, logger: ILogger, hooks?: LifecycleHooks<any>) {
    const shouldCreate = !config.noCreate;
    const port = config.port ?? 6379;
    const host = config.host ?? 'localhost';

    const dockerConfig: ContainerCreateOptions = {
      Image: config.image ?? 'redis:7',
      name: config.name ?? 'redis-server',
      ExposedPorts: { '6379/tcp': {} },
      HostConfig: {
        PortBindings: { '6379/tcp': [{ HostPort: String(port) }] },
        Binds: config.persistent ? [`redis-data-${config.name ?? 'default'}:/data`] : [],
      },
      Cmd: config.password ? ['redis-server', '--requirepass', config.password] : undefined,
    };

    super(shouldCreate ? dockerConfig : {}, logger, hooks);
    this.shouldCreate = shouldCreate;

    this.redisOptions = {
      host,
      port,
      password: config.password,
    };
  }

  async run(initialCtx: any): Promise<any> {
    if (this.shouldCreate) {
      return super.run(initialCtx);
    } else {
      this.logger.log('[RedisDockerContainer] noCreate = true: skipping container setup');
      return initialCtx;
    }
  }

  createClient(): RedisClient {
    return new Redis(this.redisOptions);
  }
}
