import { ResponseStatus, WebRouter } from "../src/app";
import express from "express";
import { z } from "zod";
import { FileName } from "../src/types/filename";
import {builtIns} from "../src/builtins/main.ts";
import {Port} from "../src/types/networking/port.ts";

interface DB {
  getUser(userId: string): string | null;
}

class ExampleDb implements DB {
  getUser(userId: string): string | null {
    return "hi";
  }
}

const app = new WebRouter({ db: new ExampleDb() });

// type ValidatorObject = Record<
//     string,
//     {   type: string
//         (v: any) => {}
//     }
// >

// function buildRoute(validator,)

app.withMiddlewares(
  builtIns.middlewares.fileUploading.defaultFileUpload(new FileName("file"))
);

/* ts


get<RequestParams, ResponseBody>(
route: string,
validator: RequestDefinitionObject<
{},
RequestParams,
ResponseBody
>,
handler: RequestHandler<
ContextType,
{},
RequestParams,
ResponseBody
>
): void {
this.expressRouter.get(route, this.wrapHandler({
body: z.object({}),
params: validator.params,
response: validator.response,
}, handler));
}


*/

// type objectSchema = z.object({
//     statusCode: z.number
// })

app.get(
  "/user/:userId",
  {
    params: z.object({
        hui: z.literal(3)
    }),
    responses: z.object({
        statusCode: z.literal(1),
         user: z.string(),
    }).or(z.object({
        userId: z.string().nonempty(),
    })),
    body: z.object({ // note here we can pass anything but it wont be available in the req.body since GET REQUESTS shouldnt have body (seriously i am talking from experience this has caused so many bugs its unimaginable ), here is the snippet to see how it made
      name: z.string(),
    }),
  },
  async (r) => {
    r.body; // there is nothong on the body
      return {
      status: new ResponseStatus(200),
      data: {
          statusCode: 1,
          user: r.params.hui.toString()
        }
      };
    }
);

app.start(new Port(3003));
