import { Optionable } from "errors-as-types/lib/rust-like-pattern/option"
import type { HttpVerb } from "../networking/httpVVerbs"
import type { OpenAPISpec } from "../openapi"
import type { ApiPath } from "../apiApth"

export interface openApiEndpointMetadata {
  operationId: Optionable<string>
  summary: Optionable<string> 
}

type Response = {

}



export interface EndpointMetadata {
  verb: HttpVerb 
  description: Optionable<string>
  responses: Response[]
} 

export interface RouterMetadata {
  getSummary(): Optionable<string>
  getHeaders(): string[]
  addEndpoint(data: EndpointMetadata): void
  toOpenApiSpec(): OpenAPISpec
}


// class SubrouteDefinition<T extends string> {
//   // Store subroutes dynamically with their names as keys
//   private subRoutes: Record<T, SubrouteDefinition<T>> = {} as Record<T, SubrouteDefinition<T>>;

//   constructor(private name: ApiPath) {}

//   // Method to get a subroute by its name, ensuring IntelliSense works
//   getSubRoute<K extends T>(subroute: K): SubrouteDefinition<T> {
//     return this.subRoutes[subroute];
//   }

//   // Method to add a subroute to the definition
//   addSubroute(subroute: SubrouteDefinition<T>, name: T) {
//     this.subRoutes[name] = subroute;
//   }

//   // You can also have other methods as needed (e.g., get all subroutes)
//   getAllSubRoutes(): T[] {
//     return Object.keys(this.subRoutes) as T[];
//   }
// }


// const app = new SubrouteDefinition(new ApiPath("l"))
// app.addSubroute(new SubrouteDefinition(new ApiPath("i")), "i")



export class SubrouteDefinition implements RouterMetadata {
  private path: ApiPath
  private subRoutes: Record<string, SubrouteDefinition> = {};
  private summary: Optionable<string> = new Optionable<string>("");
  private headers: string[] = [];
  private endpoints: EndpointMetadata[] = []
  constructor(path: ApiPath) {
    this.path = path;
  }

  toOpenApiSpec(): OpenAPISpec {
    const obj: OpenAPISpec = {
      openapi: "3.0.0",
      info: {
        title: "API Documentation",
        version: "1.0.0",
      },
      servers: [{ url: "http://localhost:3000" }],
      paths: this.endpoints,
      components: {},
    }


    

    return obj
  }

  addEndpoint(data: EndpointMetadata): void {
     this.endpoints.push(data) 
  }
  getHeaders(): string[] {
    return this.headers;
  }

  getSummary(): Optionable<string> {
    return this.summary;
  }

  getSubRoute<K extends string>(subroute: K){
    return this.subRoutes[subroute];
  }

  addSubroute(subroute: SubrouteDefinition, name: string): void {
    this.subRoutes[name] = subroute;
  }
}

