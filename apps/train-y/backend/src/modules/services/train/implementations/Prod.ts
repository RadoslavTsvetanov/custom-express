import { TypeOf, ZodObject, ZodNumber, ZodTypeAny } from "zod";
import { ITrain } from "../interface";
import { TimeStampData } from "../../../../types/timstampData";
import { id } from "../../../../types/id";
import { VPromise } from "../../../../types/Promises/vpromise";
import { IQueue } from "../../kafka/interface";

export class TrainService implements ITrain {
    private kafkaService: IQueue
    private trinaRepo: 
    constructor(kafkaService: IQueue) {
        this.kafkaService = kafkaService
    }

    getTimeData(id: id): Promise<TimeStampData<{ id: id; location: TypeOf<ZodObject<{ latitude: ZodNumber; longitude: ZodNumber; }, "strip", ZodTypeAny, { latitude?: number; longitude?: number; }, { latitude?: number; longitude?: number; }>>; }>[]> {
        
    }

    async addData(id: id, data: TimeStampData<{ id: id; location: TypeOf<ZodObject<{ latitude: ZodNumber; longitude: ZodNumber; }, "strip", ZodTypeAny, { latitude?: number; longitude?: number; }, { latitude?: number; longitude?: number; }>>; }>) {
        this.kafkaService.publishNewData(data)
    }
    
}
