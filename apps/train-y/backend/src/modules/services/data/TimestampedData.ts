import { entries } from '@custom-express/better-standard-library';

import { ITimestampedData } from "./interface";
import { VPromise } from '../../../types/Promises/vpromise';
import { timeQuery } from '../../../types/timeQuery';
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'kafka-producer',
  brokers: ['localhost:9092'], // Replace with your Kafka broker(s)
});

const producer = kafka.producer();

export async function sendEventMessage(
  topic: string,
  start_timestamp: string,
  end_timestamp: string,
  content: string
) {
  const messageValue = JSON.stringify({
    start_timestamp,
    end_timestamp,
    content,
  });

  await producer.connect();
  console.log('Producer connected');

  await producer.send({
    topic,
    messages: [{ value: messageValue }],
  });

  console.log(`Message sent to ${topic}:`, messageValue);

  await producer.disconnect();
}

export class TimestampedData implements ITimestampedData{
    async create(e: Event): VPromise {
         
    }

    async get(timeStamp: timeQuery): Promise<Event> {
        
    }

    async sendDataForConsumption(e: Event): VPromise {
        
    }
}



export const timeStampedDataShared = new TimestampedData()