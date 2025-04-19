import { Event } from "../../../db/cassandra/main";
import { VPromise } from "../../../types/Promises/vpromise";
import { timeQuery } from "../../../types/timeQuery";

export interface Idata {
    get(query: timeQuery): Event 
    save(e: Event): VPromise
}