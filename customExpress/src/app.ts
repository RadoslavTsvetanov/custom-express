import express, { Router } from "express";
import {z, ZodObject, ZodSchema, type ZodFirstPartySchemaTypes, type ZodRawShape} from "zod";
import { ApiPath } from "./types/apiApth";
import { TypeSafeClassBase } from "./utils/contextsafetype";
import * as f from "safe-envs-mk-3"
import { Optionable } from "errors-as-types/lib/rust-like-pattern/option";
import { Port} from "./types/networking/port"
import { type HttpVerb } from "./types/networking/httpVVerbs";
import {  MyOpenApiDefinitions, ParameterEnums, type RouterMetadata, SubrouteDefinition } from "./types/openapi/main";
import type {StatusCode} from "./types/networking/statusCode.ts";
import { logWithoutMethods } from "./utils/logging.ts";
import { zodSchemaIntoOpenapiResponseContentDefinition } from "./utils/zod-related/parseZodSchema.ts";
import { parseZodUnion } from "./utils/zod-related/main.ts";
import { error } from "console";
import { GetSet } from "./utils/getSetClass.ts";
import { Url } from "./types/networking/url.ts";

export class ResponseStatus extends TypeSafeClassBase<number> { }



type RequestDefinitionObject<RequestBody, RequestParams, ResponseBody, Query> = {
  body: ZodSchema<RequestBody>;
  params: ZodSchema<RequestParams>;
  query: ZodSchema<Query>
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
  ResponseBody,
  Query
> = (
  req: express.Request<RequestParams, ResponseBody, RequestBody,Query >,
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


// why are we using zod 


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




  constructor(context: ContextType, routerMetadata: RouterMetadata) {
    this.expressRouter = express.Router();
    this.context = context;
    this.routerMetadata = routerMetadata
    this.expressRouter.get("/spec", (req, res) => {
      res.json(this.routerMetadata.toOpenApiSpec())
    })
  }

  private async customResponseToExpressResponse<ResponseData>(
    res: express.Response,
    result: 
      RequestResponse<ResponseData> | RequestResponse<{ error: string }>
    
  ): Promise<void> {
    const resolvedResult = result;
    res.status(resolvedResult.status.getValue()).json(resolvedResult.data);
  }

  private wrapHandler<RequestBody, RequestParams, ResponseBody, Query >(
    validator: RequestDefinitionObject<
      RequestBody,
      RequestParams,
      ResponseBody,
      Query
    >,
    handler: RequestHandler<
      ContextType,
      RequestBody,
      RequestParams,
      ResponseBody,
      Query
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
        const queryParamsValidation = validator.query.safeParse(req.query)
        if (!bodyValidation.success || !paramsValidation.success || !queryParamsValidation!) {
        res.status(406).json({ error: ("" + bodyValidation.error?.toString() + paramsValidation.error?.toString().trim() + queryParamsValidation.error?.toString().trim())})
        return
        }
        // req.query = queryParamsValidation.data
        // Call the handler with validated data
        const result = await  handler(req, res, next, this.context);
        (() => { // todo: validate it against the validator.responses
          let isSuccesful = false
          parseZodUnion(validator.responses).map((response) => {
            if (response.safeParse(result).success) {
             isSuccesful = true
           }
          })

          if (!isSuccesful) {
            return this.customResponseToExpressResponse(res, {
                status: new ResponseStatus(403),
              data: {
                error: "response wihch was made is not from the expected"
              }
            })
          }


        })()
        await this.customResponseToExpressResponse(res, result);
      } catch (error) {
        next(error);
      }
    };
  }
  get<RequestParams, ResponseBody, Query>(
    route: ApiPath,
   validator: RequestDefinitionObject<
      {},
      RequestParams,
     ResponseBody,
      Query
    >,
    handler: RequestHandler<
      ContextType,
      {},
      RequestParams,
      ResponseBody,
      Query
      >,
    openapiEndpointMetaData?: RouteMetadata
  ): this {
    logWithoutMethods(validator)


    this.routerMetadata.addEndpoint({
      verb: "GET",
      parameters:    [(zodSchemaIntoOpenapiResponseContentDefinition(validator.params as ZodObject<any>))],
      description: ( openapiEndpointMetaData?.description ?? new Optionable("")),
      responses: [],
      route 
    })





    this.usedRoutes.GET.forEach(existingRoute => {
      if (route.value === existingRoute) {
        panic("route " + route + " for HTTP VERB get is already defined" ) // TODO: add checks like these for the rest of the http verbs 
      }
    })

    this.usedRoutes.GET.push(route.value)

    this.expressRouter.get(route.value, this.wrapHandler({
      body: z.object({}),
      params: validator.params,
      responses: validator.responses,
      query: validator.query
    }, handler));


    return this
  }

  post<RequestBody , RequestParams, ResponseBody, Query>(
    route: ApiPath,
    validator: RequestDefinitionObject<
      RequestBody,
      RequestParams,
      ResponseBody,
      Query
    >,
    handler: RequestHandler<
      ContextType,
      RequestBody,
      RequestParams,
      ResponseBody,
      Query
    >
  ): this{
    this.usedRoutes.POST.forEach(existingRoute => {
      if (route.value === existingRoute) {
        panic("route " + route + " for HTTP VERB post is already defined")
      }
    })

    this.usedRoutes.POST.push(route.value)

    this.routerMetadata.addEndpoint({
      verb: "POST",
      parameters: (() => {
        const pathParamsEntity = zodSchemaIntoOpenapiResponseContentDefinition(validator.params)

          console.log(pathParamsEntity)
        const parameters = Object.keys(pathParamsEntity.properties).map(key => {
          console.log(pathParamsEntity.properties[key], key)
          return {
            name: key,
            in: "path" as ParameterEnums.In,
            schema: pathParamsEntity.properties[key],
            required: pathParamsEntity.properties[key].required,
            style: ParameterEnums.Style.simple
          }
        })

        const paramsInQuery = zodSchemaIntoOpenapiResponseContentDefinition(validator.query)
          
          
          Object.keys(paramsInQuery.properties).forEach(key => {
          parameters.push({
            name: key,
            in: "query",
            schema: paramsInQuery.properties[key],
            required: paramsInQuery.properties[key].required,
            style: ParameterEnums.Style.simple
          })
        })

      return parameters 
      })(),
      description: new Optionable(""),
      responses:
        parseZodUnion(validator.responses).map(response => {
          return {
            content: {
              [MyOpenApiDefinitions.MIMEType.applicationJson]: {
                schema: zodSchemaIntoOpenapiResponseContentDefinition(response as ZodObject<any>)
              }
            }
          }
        })
     ,   
      
        
     
      route
    })
    this.expressRouter.post(route.value, this.wrapHandler(validator, handler));

    return this
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

  createChildRouter<NewRouterContext>(additionalContext: NewRouterContext, subPath: ApiPath) {

    const newRouter =  new WebRouter({...this.context, ...additionalContext}, this.routerMetadata.createSubRouterMetadataDefinition(subPath))
    this.expressRouter.use(subPath.value, newRouter.getExpressRouter())
    return newRouter

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
