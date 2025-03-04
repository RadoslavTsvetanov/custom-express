export type OpenAPISpec = {
  openapi: "3.0.0" | "3.1.0";
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: { url: string; description?: string }[];
  paths: {
    [path: string]: {
      [method: string]: {
        summary?: string;
        description?: string;
        tags?: string[];
        parameters?: {
          name: string;
          in: "query" | "header" | "path" | "cookie";
          required?: boolean;
          schema: { type: string };
        }[];
        requestBody?: {
          content: {
            [mediaType: string]: {
              schema: any;
            };
          };
          required?: boolean;
        };
        responses: {
          [statusCode: string]: {
            description: string;
            content?: {
              [mediaType: string]: {
                schema: any;
              };
            };
          };
        };
      };
    };
  };
  components?: {
    schemas?: {
      [name: string]: any;
    };
  };
};

