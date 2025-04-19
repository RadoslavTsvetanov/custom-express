import { Event } from "../../db/schemas/cassandra/main";
import { VPromise } from "../../types/Promises/vpromise";
import { timeQuery } from "../../types/timeQuery";

export interface ITimestampedData{
    get(timeStamp: timeQuery): Promise<Event>
    create(e: Event): VPromise
    sendDataForConsumption(e: Event) : VPromise 
}