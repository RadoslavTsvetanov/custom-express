import { Event } from "../../../../db/cassandra/main";
import { timeQuery } from "../../../../types/timeQuery";
import { CassandraDataRepo } from "../../../repos/data/implementations/cassandra";
import { IdataService } from "../interface";

const cassandraRepo = new CassandraDataRepo()

export class DataService implements IdataService {
    async get(query: timeQuery) {
    }

    async save(e: Event) {

        cassandraRepo.saveEvent(e.start, e.end, e.data)
    }
}