import { Try } from "@blazyts/better-standard-library";
import { Kafka, type KafkaConfig, type Producer } from "kafkajs";
import { z } from "zod";
import { KafkaConsumer } from "./consumer/main";
import { KafkaProducer } from "./publsiher/main";
import { ChannelsDefault } from "./types";

export class KafkaClientBuilder<Topics extends ChannelsDefault> {
  constructor() { }

  public getKafkaConsumerBuilder(): KafkaConsumer<Topics> {
    return new KafkaConsumer<Topics>({})
  }

  public KafkaProducer(config: KafkaConfig): KafkaProducer<Topics> {
    return new KafkaProducer<Topics>(config)
  }
}



// -- tests


{

  const exampleKafkaConfig = {
    data: {
      new: {
        data: z.object({ ji: z.string() })
      },
      old: {
        data: z.object({ lolo: z.string() })
      }
    }
  } as const satisfies ChannelsDefault


  const consumer = new KafkaConsumer<typeof exampleKafkaConfig>({})

  consumer.simple
}