import { ResponseStatus, WebRouter } from "../src/app";
import express from "express";
import { z } from "zod";
import { FileName } from "../src/types/filename";
import {builtIns} from "../src/builtins/main.ts";
import {Port} from "../src/types/networking/port.ts";
import { SubrouteDefinition } from "../src/types/openapi/main.ts";
import { ApiPath } from "../src/types/apiApth.ts";
import { Url } from "../src/types/networking/url.ts";
import { GetSet } from "../src/utils/getSetClass.ts";

interface DB {
  getUser(userId: string): string | null;
}

class ExampleDb implements DB {
  getUser(userId: string): string | null {
    return "hi";
  }
}

const app = new WebRouter({ db: new ExampleDb() }, new SubrouteDefinition(new Url(new GetSet("http://localhost:4000"))));

app.withMiddlewares(
  builtIns.middlewares.fileUploading.defaultFileUpload(new FileName("file"))
);


const userRouter = app.createChildRouter({usersRepo: {}}, new ApiPath("/users"))

userRouter.get(
  new ApiPath("/user/:userId"),
  {
    params: z.object({
        hui: z.literal(3)
    }),
    responses: z.object({
        statusCode: z.literal(1),
         user: z.string(),
    })
      
    //   .or(z.object({
    //     userId: z.string().nonempty(),
    // })),
    ,
    body: z.object({ // note here we can pass anything but it wont be available in the req.body since GET REQUESTS shouldnt have body (seriously i am talking from experience this has caused so many bugs its unimaginable ), here is the snippet to see how it made
      name: z.string(),
    }),
    query: z.object({
      gg: z.string().min(30)
    }),
  },
  async (r) => {
    r.body; // there is nothong on the body
      return {
      status: new ResponseStatus(200),
      data: {
          statusCode: 1 as 1, // we need to typecast 1 to 1 since by default every number is of type number not its own type representation 
          user: r.params.hui.toString()
        }
      };
    }
).post(
  new ApiPath("/user"),
  {
    body: z.object({
      name: z.string(),
    }),
    responses: z.union(
      [
        z.object({
          statusCode: z.literal(201),
          message: z.string().min(20),
        }),
        z.object({
          statusCode: z.literal(400),
          hui: z.string().min(20),
        }),
      ]
    ),
    params: z.object({
      hui: z.string(),
      userId: z.string(),
    }), 
    query: z.object({
      gg: z.string().min(30)
    }),
  },
  async (r) => {
    r.query.gg
    return {
      status: new ResponseStatus(201),
      data: {
        statusCode: 201 as 400,
        hui: "User created"
      },
    };
  }
)

app.start(new Port(3003));
