import Docker, { Container, ContainerCreateOptions } from 'dockerode';
import { Writable } from 'stream';
import { ILogger } from './logger';
import { pipefy } from './pipefy';
import { servicefy } from './servicefy';

export interface LifecycleHooks<TCtx = any> {
  onContainerStarted?: Array<(ctx: TCtx) => Promise<TCtx> | TCtx>;
  onContainerKilled?: Array<(ctx: TCtx) => Promise<TCtx> | TCtx>;
}

export class DockerWrapper<TCtx = any> {
  protected docker: Docker;
  protected config: ContainerCreateOptions;
  protected logger: ILogger;
  protected hooks: LifecycleHooks<TCtx>;
  protected container?: Container;

  constructor(
    config: ContainerCreateOptions,
    logger?: ILogger,
    hooks?: LifecycleHooks<TCtx>
  ) {
    this.docker = new Docker();
    this.config = config;
    this.logger = logger ? servicefy(logger) : console;
    this.hooks = hooks ?? {};
  }

  async run(initialCtx: TCtx): Promise<TCtx> {
    try {
      const image = this.config.Image;
      if (!image) throw new Error('Image is required in config');

      await this.pullImage(image);
      this.container = await this.docker.createContainer(this.config);
      await this.container.start();

      this.logger.log(`Container started: ${this.container.id}`);

      if (this.hooks.onContainerStarted?.length) {
        const runHooks = pipefy(this.hooks.onContainerStarted);
        initialCtx = await runHooks(initialCtx);
      }

      await this.attachLogs(this.container);
      return initialCtx;
    } catch (err: any) {
      this.logger.error(`Docker run failed: ${err.message}`);
      throw err;
    }
  }

  async stopAndRemove(initialCtx: TCtx): Promise<TCtx> {
    if (!this.container) return initialCtx;

    try {
      await this.container.stop();
      await this.container.remove();

      this.logger.log(`Container ${this.container.id} stopped and removed.`);

      if (this.hooks.onContainerKilled?.length) {
        const runHooks = pipefy(this.hooks.onContainerKilled);
        initialCtx = await runHooks(initialCtx);
      }

      return initialCtx;
    } catch (err: any) {
      this.logger.error(`Stop/remove failed: ${err.message}`);
      throw err;
    }
  }

  protected async pullImage(image: string): Promise<void> {
    this.logger.log(`Pulling image: ${image}`);
    return new Promise((resolve, reject) => {
      this.docker.pull(image, (err, stream) => {
        if (err) return reject(err);
        this.docker.modem.followProgress(
          stream,
          (err) => (err ? reject(err) : resolve()),
          (evt) => evt.status && this.logger.log(`[pull] ${evt.status} ${evt.progress || ''}`)
        );
      });
    });
  }

  protected async attachLogs(container: Container): Promise<void> {
    const stream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
      tail: 'all',
    });

    const writable = new Writable({
      write: (chunk, _enc, cb) => {
        this.logger.log(chunk.toString());
        cb();
      },
    });

    this.docker.modem.demuxStream(stream, writable, writable);

    stream.on('end', () => {
      this.logger.log(`Container ${container.id} log stream ended.`);
    });
  }
}