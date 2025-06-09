import { KafkaConsumer } from "./cleints/consumer/main";
import { KafkaClientBuilder } from "./cleints/main";
import { ChannelsDefault } from "./cleints/types";


export class KafkaConfig<Channels extends ChannelsDefault> {
    private channels: Channels;
    constructor(channels: Channels) {
        this.channels = channels;
    }

    public get channel(): Channels {
        return this.channels;
    }

    public generateClient() {
        return new KafkaConsumer<Channels>({});
    }
}
