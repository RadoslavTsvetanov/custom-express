import type { ZodObject, ZodRawShape } from "zod";

import { Optionable } from "errors-as-types/lib/rust-like-pattern/option";
import { z } from "zod";

import type { ApiPath } from "../apiApth.ts";
import type { WithDescription } from "../generaltypes.ts";
import type { HttpVerb } from "../networking/httpVVerbs.ts";
import type { Url } from "../networking/url.ts";
import type { MyZodDefinitions } from "../zod/zod.ts";

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
    export enum MIMEType {
        textPlain = "text/plain",
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
        required: boolean;
        checks: Record<string, string>;
    } & WithDescription;

    export type Response = {
        [ statusCode: string]: {
            content?: {
                [type in MIMEType]: {
                    schema: Entity;
                }
            };
        } & WithDescription;
    };

    export type Parameter = {
        name: string;
        in: ParameterEnums.In;
        description?: string;
        required: boolean;
        style: ParameterEnums.Style;
        schema: Entity;
    };

    export type Body = {
        description?: string;
        required: boolean;
        content: Record<string, { schema: { $ref: string } }>;
    };

    export type EndpointMetadata = {
        route: ApiPath;
        verb: HttpVerb;
        description: Optionable<string>;
        parameters: Parameter[];
        body?: Body;
        responses: Response[];
    };

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

export type RouterMetadata = { //
    getBaseUrl: () => Url;
    getSummary: () => Optionable<string>;
    getHeaders: () => string[];
    addEndpoint: (data: MyOpenApiDefinitions.EndpointMetadata) => void;
    toOpenApiSpec: () => MyOpenApiDefinitions.Spec;
    createSubRouterMetadataDefinition: (path: ApiPath) => RouterMetadata;
    getSubroutes: () => Record<string, SubrouteDefinition>;
};

export class SubrouteDefinition implements RouterMetadata {
    private subRoutes: Record<string, SubrouteDefinition> = {};
    private summary: Optionable<string> = new Optionable<string>("");
    private headers: string[] = [];
    private endpoints: MyOpenApiDefinitions.EndpointMetadata[] = [];
    private baseUrl: Url;
    constructor(private baseURl: Url) {
        this.baseUrl = baseURl;
    }

    createSubRouterMetadataDefinition(path: ApiPath): RouterMetadata {
        const newSubroute = new SubrouteDefinition(this.baseURl.addPath(path));
        this.subRoutes[path.value] = newSubroute;
        return newSubroute;
    }

    private parseSubPathStrcuture(s: SubrouteDefinition, pathsEntries: MyOpenApiDefinitions.SpecRoutePaths) {
        const subRoutes = s.getSubroutes();
        Object.keys(subRoutes).map((key) => {
            subRoutes[key].endpoints.map((endpoint) => {
                pathsEntries[(this.baseURl.value.getV()).replace(this.baseURl.value.getV(), "") + endpoint.route.value] = this.mapEndpointToSpecRouteDefinitionEntry(endpoint);
            });

            this.parseSubPathStrcuture(subRoutes[key], pathsEntries);
        });
    }

    private mapEndpointToSpecRouteDefinitionEntry(endpoint: MyOpenApiDefinitions.EndpointMetadata) {
        const pathEntry: MyOpenApiDefinitions.SpecRoutePathEndpointEntry = {
            [endpoint.verb]: {
                description: endpoint.description.unpack_with_default(""),
                summary: endpoint.description.unpack_with_default(""),
                tags: ["API"],
                parameters: endpoint.parameters,
                requestBody: endpoint.body,
                responses: endpoint.responses,
            },
        };

        return pathEntry;
    }

    toOpenApiSpec(): MyOpenApiDefinitions.Spec {
        const pathsEntry: MyOpenApiDefinitions.SpecRoutePaths = {};

        this.endpoints.map((endpoint) => {
            pathsEntry[(endpoint.route.value)] = this.mapEndpointToSpecRouteDefinitionEntry(endpoint);
        });

        Object.keys(this.subRoutes).map((key) => {
            this.subRoutes[key].endpoints.map((endpoint) => {
                pathsEntry[this.subRoutes[key].baseURl.value.getV().replace(this.baseURl.value.getV(), "") + endpoint.route.value] = this.mapEndpointToSpecRouteDefinitionEntry(endpoint);
            });

            this.parseSubPathStrcuture(this.subRoutes[key], pathsEntry);
        });

        return {
            openapi: "3.0.0",
            info: { title: "API Documentation", version: "1.0.0" },
            servers: [{ url: this.baseURl.value.getV() }],
            paths: pathsEntry,
            components: {},
        };
    }

    addEndpoint(data: MyOpenApiDefinitions.EndpointMetadata & { route: ApiPath }): void {
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

    getBaseUrl(): Url {
        return this.baseUrl;
    }

    getSubroutes(): Record<string, SubrouteDefinition> {
        return this.subRoutes;
    }

    addSubroute(subroute: SubrouteDefinition, name: string): void {
        this.subRoutes[name] = subroute;
    }
}

type fff<T extends MyZodDefinitions.ObjectUnion> = z.ZodUnion<T>;

const g = z.union([
    z.object({
        g: z.string(),
    }),
    z.object({
        u: z.string(),
    }),
]);

const f = z.object({
    g: z.string(),
    u: z.string(),
    a: z.string(),
});

function customObjectType<T extends ZodObject<Y>, Y extends ZodRawShape>(key: string, g: ZodObject<any>, existingObject: T) {
    return z.object({
        ...existingObject.shape,
        [key]: g,
    });
}

const r = customObjectType<{ [key: string]: ZodObject }>("", z.object({}), z.object({}));

export type ZodObject3 = typeof r;

const h: ZodObject3<{ [key: string]: ZodObject } > = z.object({});

function tgtg<T extends MyZodDefinitions.ObjectUnion>(z: fff<T>) {
    return z;
}
