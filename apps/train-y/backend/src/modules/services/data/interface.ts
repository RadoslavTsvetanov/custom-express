import { Event } from "../../../db/cassandra/main";
import { VPromise } from "../../../types/Promises/vpromise";
import { timeQuery } from "../../../types/timeQuery";

export interface IdataService{
    get(query: timeQuery): Promise<Event>
    save(e: Event): VPromise
}