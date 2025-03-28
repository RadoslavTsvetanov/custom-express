import { RouterMetadata } from './../../../../src/types/openapi/main';
import { WebRouter } from "../../../../src/app";
import { Port } from '../../../../src/types/networking/port';
import { ApiPath } from '../../../../src/types/apiApth';
import { z } from 'zod';



const app = new WebRouter({}, {}, new Port(3000))


const trainRouter = app.createChildRouter({}, new ApiPath("/train"))

trainRouter.get(new ApiPath("/data"), {
    query: z.object({
        start: z.date(),
        end: z.date()
    })
},
    r => {
    r.query.start 
    },
    {
        description: ""
}
)