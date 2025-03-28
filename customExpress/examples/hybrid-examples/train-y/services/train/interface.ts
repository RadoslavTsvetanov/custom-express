import { schemas } from './../../types/schemas';
import type { Timestamp } from "aws-sdk/clients/cloudformation";
import type { id } from "../../types/id";
import type { TODO } from "../../types/todo";
import type { VPromise } from "../../types/Promises/vpromise";
import type { TimeStampData } from "../../types/timstampData";
import type { TimeQueriableDTO } from "../../DTO/partials/timequeriable";
import type { z } from "zod";
import type { locationData } from '../../types/location';



export interface ITrain<T extends {id: id, location: locationData} = {id: id, location: z.infer<typeof schemas.location>}> extends TimeQueriableDTO<T>{
}