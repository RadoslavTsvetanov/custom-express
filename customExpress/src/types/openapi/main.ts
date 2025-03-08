
import { Optionable } from "errors-as-types/lib/rust-like-pattern/option";
import type {HttpVerb} from "../networking/httpVVerbs.ts";
import type {ApiPath} from "../apiApth.ts";

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
  }
  export type Entity = {
    type: MyOpenApiDefinitions.ParameterType;
    properties: Record<string, Entity>;
  };

  export type Response = {
   [ statusCode: string]: {
     description: string;
     content?: {
       [type in MIMEType]: {
         schema: Entity
       }
     }
   }
  };

  export type Parameter = {
    name: string;
    in: ParameterEnums.In;
    description?: string;
    required: boolean;
    style: ParameterEnums.Style;
    schema: {
      type: MyOpenApiDefinitions.ParameterType;
      items?: { type: MyOpenApiDefinitions.ParameterType };
    };
  };

  export interface Body {
    description?: string;
    required: boolean;
    content: Record<string, { schema: { $ref: string } }>;
  }

  export interface EndpointMetadata {
    verb: HttpVerb;
    description: Optionable<string>;
    parameters: Parameter[];
    body: Body;
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

export interface RouterMetadata {
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
    const pathsEntry: MyOpenApiDefinitions.SpecRoutePaths = {



    };

    return {
      openapi: "3.0.0",
      info: { title: "API Documentation", version: "1.0.0" },
      servers: [{ url: "http://localhost:3000" }],
      paths: pathsEntry,
      components: {},
    };
  }

  addEndpoint(data: MyOpenApiDefinitions.EndpointMetadata): void {
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
