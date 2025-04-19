import { TypeOf, ZodObject, ZodNumber, ZodTypeAny } from "zod";
import { id } from "../../../types/id";
import { VPromise } from "../../../types/Promises/vpromise";
import { TimeStampData } from "../../../types/timstampData";
import { ITrain } from "../interface";
import { timeStampedDataShared } from "../../data/TimestampedData";

export class TrainService implements ITrain {
    constructor(){}
    
    getTimeData(id: id): Promise<TimeStampData<{ id: id; location: TypeOf<ZodObject<{ latitude: ZodNumber; longitude: ZodNumber; }, "strip", ZodTypeAny, { latitude?: number; longitude?: number; }, { latitude?: number; longitude?: number; }>>; }>[]> {
        throw new Error("Method not implemented.");
    }

    async addData(id: id, data: TimeStampData<{ id: id; location: TypeOf<ZodObject<{ latitude: ZodNumber; longitude: ZodNumber; }, "strip", ZodTypeAny, { latitude?: number; longitude?: number; }, { latitude?: number; longitude?: number; }>>; }>): VPromise {
        timeStampedDataShared.sendDataForConsumption(data)
    }
    
}