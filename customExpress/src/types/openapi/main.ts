
import { Optionable } from "errors-as-types/lib/rust-like-pattern/option";
import type {HttpVerb} from "../networking/httpVVerbs.ts";
import type {ApiPath} from "../apiApth.ts";
import type { ApiAccess } from "aws-sdk/clients/finspacedata";
import type { WithDescription } from "../generaltypes.ts";

export namespace ParameterEnums {
  export type In = "query" | "header" | "path" | "cookie";

  export enum Style {
    form = "form",
    simple = "simple",
    label = "label",
    spaceDelimited = "spaceDelimited",
    pipeDelimited = "pipeDelimited",
    deepObject = "deepObject",
  }
}

export namespace MyOpenApiDefinitions {
  export enum MIMEType  {
    textPlain =  "text/plain",
    applicationJson = "application/json",
  }

  export type Path = string;

  export type RouteDefinition = {
    [key in HttpVerb]: {
      responses: Response[];
    };
  };

  export enum ParameterType {
    string = "string",
    number = "number",
    integer = "integer",
    boolean = "boolean",
    object = "object",
    array = "array",
    unknown = "unknown",
  }
  export type Entity = { // note on the entity we support more things than the tradiotianl openapi object but its extension so it wont break existing openapi integrations 
    type: MyOpenApiDefinitions.ParameterType;
    properties: Record<string, Entity>;
    required: boolean
    checks: Record<string, string>
  } & WithDescription;

  export type Response = {
   [ statusCode: string]: {
     content?: {
       [type in MIMEType]: {
         schema: Entity
       }
     }
   } & WithDescription
  };

  export type Parameter = {
    name: string;
    in: ParameterEnums.In;
    description?: string;
    required: boolean;
    style: ParameterEnums.Style;
    schema: Entity
  };

  export interface Body {
    description?: string;
    required: boolean;
    content: Record<string, { schema: { $ref: string } }>;
  }

  export interface EndpointMetadata {
    route: ApiPath 
    verb: HttpVerb;
    description: Optionable<string>;
    parameters: Parameter[];
    body?: Body;
    responses: Response[];
  }

  export type SpecRoutePathEndpointEntry = Partial<Record<HttpVerb, {
    summary?: string;
    description?: string;
    tags?: string[];
    parameters?: Parameter[];
    requestBody?: Body;
    responses: Record<string, Response>;
  }>>;

  export type SpecRoutePaths = Record<Path, SpecRoutePathEndpointEntry>;

  export type Spec = {
    openapi: "3.0.0" | "3.1.0";
    info: {
      title: string;
      version: string;
      description?: string;
    };
    servers?: { url: string; description?: string }[];
    paths: SpecRoutePaths;
    components?: { schemas?: Record<string, any> };
  };
}

export interface RouterMetadata { //
  getSummary(): Optionable<string>;
  getHeaders(): string[];
  addEndpoint(data: MyOpenApiDefinitions.EndpointMetadata): void;
  toOpenApiSpec(): MyOpenApiDefinitions.Spec;
}

export class SubrouteDefinition implements RouterMetadata {
  private subRoutes: Record<string, SubrouteDefinition> = {};
  private summary: Optionable<string> = new Optionable<string>("");
  private headers: string[] = [];
  private endpoints: MyOpenApiDefinitions.EndpointMetadata[] = [];

  constructor(private path: ApiPath) {

  }

  toOpenApiSpec(): MyOpenApiDefinitions.Spec {
    const pathsEntry: MyOpenApiDefinitions.SpecRoutePaths = {};
    this.endpoints.map((endpoint) => {
      const pathEntry: MyOpenApiDefinitions.SpecRoutePathEndpointEntry = {
        [endpoint.verb]:{
        description: endpoint.description,
        tags: ["API"],
        parameters: endpoint.parameters,
        requestBody: endpoint.body,
        responses: endpoint.responses,
        }
        
      };
      pathsEntry[endpoint.route.value] = pathEntry;
    })

    return {
      openapi: "3.0.0",
      info: { title: "API Documentation", version: "1.0.0" },
      servers: [{ url: "http://localhost:3000" }],
      paths: pathsEntry,
      components: {},
    };
  }

  addEndpoint(data: MyOpenApiDefinitions.EndpointMetadata & {route: ApiPath}): void {
    this.endpoints.push(data);
  }

  getHeaders(): string[] {
    return this.headers;
  }

  getSummary(): Optionable<string> {
    return this.summary;
  }

  getSubRoute<K extends string>(subroute: K): SubrouteDefinition {
    return this.subRoutes[subroute];
  }

  addSubroute(subroute: SubrouteDefinition, name: string): void {
    this.subRoutes[name] = subroute;
  }
}
