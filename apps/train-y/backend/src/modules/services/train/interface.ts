import { z } from "zod";
import { id } from "../../../types/id";
import { locationData } from "../../../types/location";
import { schemas } from "../../../types/schemas";
import { TimeQueriableDTO } from "../../DTO/partials/timequeriable";


export interface ITrain<T extends {id: id, location: locationData} = {id: id, location: z.infer<typeof schemas.location>}> extends TimeQueriableDTO<T>{
}