import { Kafka, Producer } from "kafkajs";
import { KafkaConfig } from "../../ConfigBuilder";
import { ChannelsDefault } from "../types";

export class KafkaProducer<Topics extends ChannelsDefault> {
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
