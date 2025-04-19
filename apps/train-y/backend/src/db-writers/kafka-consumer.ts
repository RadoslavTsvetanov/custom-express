import { Kafka } from 'kafkajs';
import { TimestampedData, timeStampedDataShared } from '../services/data/TimestampedData';

const kafka = new Kafka({
  clientId: 'kafka-consumer',
  brokers: ['localhost:9092'], // Replace with your Kafka brokers
});

const consumer = kafka.consumer({ groupId: 'data-consumer' });

async function run() {
  await consumer.connect();
  console.log('Kafka Consumer connected');

  await consumer.subscribe({ topic: 'your_topic_name', fromBeginning: true });

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received message: ${message.value?.toString()}`);

      const messageData = JSON.parse(message.value?.toString() || '{}');
      const { start_timestamp, end_timestamp, content } = messageData;

      if (!start_timestamp || !end_timestamp || !content) {
        console.error('Invalid message format');
        return;
      }

      await timeStampedDataShared.create(content);
    },
  });
}

run().catch(console.error);
