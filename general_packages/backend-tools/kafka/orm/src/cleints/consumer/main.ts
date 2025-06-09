import { Try } from "@blazyts/better-standard-library";
import { ChannelsDefault, Config, Options } from "../types";
import { KafkaClientBuilder } from "../main";
import { Kafka } from "kafkajs";

  export class KafkaConsumer<Topics extends ChannelsDefault> {
    private messageConfig: Config<Topics>;

        public get Config(): typeof this.messageConfig {}
      
    constructor(messageConfig: Config<Topics>) {
      this.messageConfig = messageConfig;
    }

    addListener<Topic extends keyof Topics>(
      topic: Topic,
      config: (v: Topics[Topic]) => Promise<void>
    ) {
      Try(this.messageConfig[topic], {
        ifNone: () => (this.messageConfig[topic] = config),
        ifNotNone: (v) => {
          throw new Error(
            `${JSON.stringify(topic)} already has defioned handler`
          );
        },
      });
    }

    run() {}

    async simple(handlers: Config<Topics>, config: Options) {
      const kafka = new Kafka({
        clientId: config.clientId,
        brokers: config.brokers, // Replace with your Kafka broker
      });

      const consumer = kafka.consumer({ groupId: config.group });

      await consumer.connect()
      await consumer.subscribe({
        topics: Object.keys(this.messageConfig),
        fromBeginning: true,
      })

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          Try(
            this.messageConfig[topic],
            {
              ifNone: () => { },
              ifNotNone: v => v(JSON.parse(message.value?.toString())),
            }
          )
        },
      })
    }

  }