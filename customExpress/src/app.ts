import express, { Router } from "express";
import {z, ZodObject, ZodSchema, type ZodFirstPartySchemaTypes} from "zod";
import { ApiPath } from "./types/apiApth";
import { TypeSafeClassBase } from "./utils/contextsafetype";
import * as f from "safe-envs-mk-3"
import { Optionable } from "errors-as-types/lib/rust-like-pattern/option";
import { Port} from "./types/networking/port"
import { HttpVerb } from "./types/networking/httpVVerbs";
import {  type RouterMetadata, SubrouteDefinition } from "./types/openapi/main";
import type {StatusCode} from "./types/networking/statusCode.ts";

export class ResponseStatus extends TypeSafeClassBase<number> { }



type RequestDefinitionObject<RequestBody, RequestParams, ResponseBody> = {
  body: ZodSchema<RequestBody>;
  params: ZodSchema<RequestParams>;
  // responses: {statusCode: StatusCode, schema: ZodSchema<ResponseBody>}[];
  responses: ZodSchema<ResponseBody>
};


export type RequestResponse<ResponseData> = {
  status: ResponseStatus;
  data: ResponseData;
};

export type RequestHandler<
  ContextType,
  RequestBody,
  RequestParams,
  ResponseBody
> = (
  req: express.Request<RequestParams, ResponseBody, RequestBody>,
  res: express.Response<ResponseBody>,
  next: express.NextFunction,
  ctx: ContextType
) => Promise<
  RequestResponse<ResponseBody> | RequestResponse<{ error: string }>
>;
function panic(msg: string = ""): void {
  throw new Error(msg)
}

type RouteMetadata= {
  description: Optionable<string>
}

export class WebRouter<ContextType> {
  protected context: ContextType;
  protected expressRouter: Router;
  protected routerMetadata: RouterMetadata
  private  readonly usedRoutes: Record<HttpVerb, string[]> = {
    GET: [],
    POST: [],
    DELETE: [],
    PUT: [],
    PATCH: [],
    OPTIONS: [],
  };




  constructor(context: ContextType) {
    this.expressRouter = express.Router();
    this.context = context;
    this.expressRouter.get("/spec", (req, res) => {
      res.json(this.routerMetadata.toOpenApiSpec())
    })
    this.routerMetadata
  }

  private async customResponseToExpressResponse<ResponseData>(
    res: express.Response,
    result: Promise<
      RequestResponse<ResponseData> | RequestResponse<{ error: string }>
    >
  ): Promise<void> {
    const resolvedResult = await result;
    res.status(resolvedResult.status.getValue()).json(resolvedResult.data);
  }

  private wrapHandler<RequestBody, RequestParams, ResponseBody>(
    validator: RequestDefinitionObject<
      RequestBody,
      RequestParams,
      ResponseBody
    >,
    handler: RequestHandler<
      ContextType,
      RequestBody,
      RequestParams,
      ResponseBody
    >
  ) {
    return async (
      req: express.Request<RequestParams, ResponseBody, RequestBody>,
      res: express.Response<ResponseBody | {error: string}>,
      next: express.NextFunction
    ) => {
      try {
        const bodyValidation = validator.body.safeParse(req.body);
        const paramsValidation = validator.params.safeParse(req.params);

        if (!bodyValidation.success || !paramsValidation.success) {
        res.status(406).json({ error: ("" + bodyValidation.error?.toString() + paramsValidation.error?.toString().trim() )})
        return
        }

        // Call the handler with validated data
        const result = handler(req, res, next, this.context);
        const resultValidation = (() => {
          validator.responses

        })()
        await this.customResponseToExpressResponse(res, result);
      } catch (error) {
        next(error);
      }
    };
  }
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
      >,
    openapiEndpointMetaData?: RouteMetadata
  ): void {
    // this.routerMetadata.addEndpoint({
    //   verb: "GET",
    //   parameters:   validator.body.shape
    //   description: (openapiMetaData?.summary || new Optionable<string>(null)),
    //   body:,
    //   responses: validator.responses
    // })





    this.usedRoutes.GET.forEach(existingRoute => {
      if (route === existingRoute) {
        panic("route " + route + " for HTTP VERB get is already defined" ) // TODO: add checks like these for the rest of the http verbs 
      }
    })

    this.usedRoutes.GET.push(route)

    this.expressRouter.get(route, this.wrapHandler({
      body: z.object({}),
      params: validator.params,
      responses: validator.responses,
    }, handler));
  }

  post<RequestBody, RequestParams, ResponseBody>(
    route: string,
    validator: RequestDefinitionObject<
      RequestBody,
      RequestParams,
      ResponseBody
    >,
    handler: RequestHandler<
      ContextType,
      RequestBody,
      RequestParams,
      ResponseBody
    >
  ): void {
    this.expressRouter.post(route, this.wrapHandler(validator, handler));
  }

  delete<RequestBody, RequestParams, ResponseBody>(
    route: string,
    validator: RequestDefinitionObject<
      RequestBody,
      RequestParams,
      ResponseBody
    >,
    handler: RequestHandler<
      ContextType,
      RequestBody,
      RequestParams,
      ResponseBody
    >
  ): void {
    this.expressRouter.delete(route, this.wrapHandler(validator, handler));
  }

  put<RequestBody, RequestParams, ResponseBody>(
    route: string,
    validator: RequestDefinitionObject<
      RequestBody,
      RequestParams,
      ResponseBody
    >,
    handler: RequestHandler<
      ContextType,
      RequestBody,
      RequestParams,
      ResponseBody
    >
  ): void {
    this.expressRouter.put(route, this.wrapHandler(validator, handler));
  }

  withMiddlewares(...middlewares: express.RequestHandler[]): this {
    middlewares.forEach((middleware) => {
      this.expressRouter.use(middleware);
    });

    return this;
  }

  addSubRouter(path: ApiPath, router: express.Router): void {
    this.expressRouter.use(path.value, router);
  }

  getExpressRouter(): Router {
    return this.expressRouter;
  }

  start(port: Port): void {
    const app = express();
    app.use(express.json()); // Ensure JSON parsing middleware is used
    app.use(this.expressRouter);
    app.listen(port.value, () => {
      console.log(`Server is running on port ${port.value}`);
    });
  }
}


export class App<ContextType> extends WebRouter<ContextType>{
  private metadata: SubrouteDefinition
  constructor(context: ContextType) {
    super(context)
    this.metadata = new SubrouteDefinition(new ApiPath("/"))
  }


  createChildRouter<NewRouterContextType>(subpath: ApiPath, context: NewRouterContextType): WebRouter<NewRouterContextType & ContextType> {




    const newRouter = new WebRouter({...this.context, ...context}, this.metadata.getSubRoute(subpath.value))


    this.expressRouter.use(subpath.value, newRouter.getExpressRouter())
    return newRouter
  }

}