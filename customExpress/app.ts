import express, { Router } from "express";
import { reduceEachTrailingCommentRange } from "typescript";
import type { Port } from "./types/networking/port";
import multer from "multer"
import { FileName } from "./types/filename";


class TypeSafeClassBase<T> {
  private v: T;
  constructor(v: T) {
    this.v = v;
  }
  getV(): T {
    return this.v;
  }
}

export class ResponseStatus extends TypeSafeClassBase<number> {}




export type RequestResponse<Body> = {
  status: ResponseStatus;
  data: Body;
};

export type RequestHandler<Context, Body, Params, ResponseData> = (
  req: express.Request<Params, ResponseData, Body>,
  res: express.Response<ResponseData>,
  next: express.NextFunction,
  ctx: Context
) => Promise<RequestResponse<ResponseData> | RequestResponse<{error: string}>>;

const upload = multer({ storage: multer.memoryStorage()})

const fileUploading = {
  defaultFileUpload: (NameForAccessingTheFile: FileName) => {return upload.single(NameForAccessingTheFile.value)}, 
  multipleFilesUpload: (NameForAccessingTheFiles: FileName, maxFilesCountAllowed: number) => { return upload.array(NameForAccessingTheFiles.value,maxFilesCountAllowed ) }
}

export const builtIns = {
  middlewares: {
    fileUploading,
  }
}



export class WebRouter<Context> {
  private context: Context;
  private expressRouter: Router;

  constructor(context: Context) {
    this.expressRouter = express.Router();
    this.context = context;
  }

  private async customResponseToExpressResponse<Body>(
    res: express.Response,
    result: Promise<RequestResponse<Body>>
  ): Promise<void> {
    const resolvedResult = await result;
    res.status(resolvedResult.status.getV()).json(resolvedResult.data);
  }




  // think of wrap handler as a normal express handler since thats what it is and from there we 
  // on top of it we define our handler
  private wrapHandler<Body, Params, ResponseData>(
    handler: RequestHandler<Context, Body, Params, ResponseData>
  ) {
    return async (
      req: express.Request<Params, ResponseData, Body>,
      res: express.Response<ResponseData>,
      next: express.NextFunction
    ) => {
      try {
        const result = handler(req, res, next, this.context);
        await this.customResponseToExpressResponse(res, result);
      } catch (error) {
        next(error);
      }
    };
  }

  get<RequestBody, RequestParams, ResponseData>(
    route: string,
    handler: RequestHandler<Context, RequestBody, RequestParams, ResponseData>
  ): void {
    this.expressRouter.get(route, this.wrapHandler(handler));
  }

  post<RequestBody, RequestParams, ResponseData>(
    route: string,
    handler: RequestHandler<Context, RequestBody, RequestParams, ResponseData>
  ): void {
    this.expressRouter.post(route, this.wrapHandler(handler));
  }

  delete<RequestBody, RequestParams, ResponseData>(
    route: string,
    handler: RequestHandler<Context, RequestBody, RequestParams, ResponseData>
  ): void {
    this.expressRouter.delete(route, this.wrapHandler(handler));
  }

  put<RequestBody, RequestParams, ResponseData>(
    route: string,
    handler: RequestHandler<Context, RequestBody, RequestParams, ResponseData>
  ): void {
    this.expressRouter.put(route, this.wrapHandler(handler));
  }

  // note that the order matters since middlewares are executed in the order they added 
  withMiddlewares(...middlewares: express.RequestHandler[]): this {
    middlewares.forEach((middleware) => {
      this.expressRouter.use(middleware);
    });

    return this
  }

  getExpressRouter(): Router {
    return this.expressRouter;
  }

  start(port: Port) {
    const app = express()
    app.use(this.expressRouter)
    app.listen(port.value, () => {
      console.log(`Server is running on port ${port.value}`);
    });
  }
}
