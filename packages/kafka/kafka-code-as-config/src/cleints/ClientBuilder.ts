import { Try } from "@custom-express/better-standard-library";
import type { ChannelsDefault, DefaultChannel } from "../../types";
import { Kafka, type KafkaConfig, type Producer } from "kafkajs";
import { z } from "zod";

export namespace KafkaClient {
  type Config<Topics extends ChannelsDefault> = {
    [Topic in keyof Topics]?: (v: Topics[Topic]) => Promise<void>;
  };

  export type Options = {
    group: string;
    clientId: string;
    brokers: string[] /* in the fufutre implement a context safe type here*/;
  };

    export class KafkaClientBuilder<Topics extends ChannelsDefault> {
        constructor(){}

        public getKafkaConsumerBuilder(): KafkaConsumer<Topics> {
            return new KafkaConsumer<Topics>({})
        }

        public KafkaProducer(config: KafkaConfig): KafkaProducer<Topics>{
            return new KafkaProducer<Topics>(config)
        } 
    }

    export class KafkaProducer<Topics extends ChannelsDefault>{
private readonly kafka: Kafka;
    private readonly producer: Producer;

        constructor(config: KafkaConfig) {
            this.kafka = new Kafka(config);
            this.producer = this.kafka.producer();
        }

        
        async send<Topic extends keyof Topics>(topic: Topic, data: Topics[Topic]) {
            await this.producer.send({
            topic: topic as string,
            messages: [{ value: JSON.stringify(data) }],
        });

        }
    }
    
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

    async simple(handlers: Config<Topics>, config: KafkaClient.Options) {
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
}



// -- tests


{

    const exampleKafkaConfig = {
        data: {
            new: {
                data: z.object({ji: z.string()})
            },
            old: {
                data: z.object({lolo: z.string()})
            }
        }
    } as const satisfies ChannelsDefault


    const consumer = new KafkaClient.KafkaConsumer<typeof exampleKafkaConfig>({})

    consumer.simple({
        data: 
    })
}