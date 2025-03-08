import {Url} from "./networking/url.ts";
import {MyOpenApiDefinitions} from "./openapi/main.ts";
import {z} from "zod";





namespace Client {

    export type Metadata = {
        url: Url
    }

    const endpointObject = z.object()

    type Endpoints<T extends string, Y> = Record<T, Y>




}





class Client<T extends string>{
    private metadata: Client.Metadata;



    readonly routes
    constructor(metadata: Client.Metadata, endpoints: (MyOpenApiDefinitions.EndpointMetadata)[]){

    }


}