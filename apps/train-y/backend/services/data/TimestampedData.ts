import { entries } from '@custom-express/better-standard-library';
import { Event } from "../../db/schemas/cassandra/main";
import { VPromise } from "../../types/Promises/vpromise";
import { timeQuery } from "../../types/timeQuery";
import { ITimestampedData } from "./interface";

export class TimestampedData implements ITimestampedData{
    async create(e: Event): VPromise {
         
    }

    async get(timeStamp: timeQuery): Promise<Event> {
        
    }

    async sendDataForConsumption(e: Event): VPromise {
        
    }
}



export const timeStampedDataShared = new TimestampedData()