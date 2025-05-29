import type { ChannelsDefault } from '../types'

import { KafkaClient } from './cleints/ClientBuilder'

export class KafkaConfig<Channels extends ChannelsDefault> {
  private channels: Channels
  constructor(channels: Channels) {
    this.channels = channels
  }

  public get channel(): Channels {
    return this.channels
  }

  public generateClient() {
    return new KafkaClient.KafkaConsumer<Channels>({})
  }
}
