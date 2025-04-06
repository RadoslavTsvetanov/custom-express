/**
 * TypeScript definitions for AsyncAPI 3.0.0 specification
 */

// Core AsyncAPI Document
export interface AsyncAPIDocument {
  asyncapi: string; // Always '3.0.0'
  info: Info;
  servers?: Record<string, Server>;
  channels?: Record<string, ChannelItem>;
  operations?: Record<string, Operation>;
  components?: Components;
  defaultContentType?: string;
  externalDocs?: ExternalDocumentation;
  tags?: Tag[];
}

// Info Object
export interface Info {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: Contact;
  license?: License;
  summary?: string;
  tags?: Tag[];
  externalDocs?: ExternalDocumentation;
}

export interface Contact {
  name?: string;
  url?: string;
  email?: string;
}

export interface License {
  name: string;
  url?: string;
}

// Server Object
export interface Server {
  host?: string;
  protocol: string;
  protocolVersion?: string;
  description?: string;
  variables?: Record<string, ServerVariable>;
  security?: Array<SecurityRequirement>;
  tags?: Tag[];
  externalDocs?: ExternalDocumentation;
  bindings?: ServerBindings;
}

export interface ServerVariable {
  enum?: string[];
  default?: string;
  description?: string;
  examples?: string[];
}

// Channel Object
export interface ChannelItem {
  address?: string;
  messages?: Record<string, MessageReference | ReferenceObject>;
  description?: string;
  servers?: Array<ServerReference | ReferenceObject>;
  parameters?: Record<string, ParameterReference | ReferenceObject>;
  tags?: Tag[];
  externalDocs?: ExternalDocumentation;
  bindings?: ChannelBindings;
}

// Operation Object
export interface Operation {
  action: "send" | "receive";
  channel: ChannelReference | ReferenceObject;
  messages?: Array<MessageReference | ReferenceObject>;
  title?: string;
  summary?: string;
  description?: string;
  security?: Array<SecurityRequirement>;
  tags?: Tag[];
  externalDocs?: ExternalDocumentation;
  bindings?: OperationBindings;
  traits?: Array<OperationTrait | ReferenceObject>;
}

// Message Object
export interface Message {
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  contentType?: string;
  payload?: Schema | ReferenceObject;
  correlationId?: CorrelationId | ReferenceObject;
  tags?: Tag[];
  externalDocs?: ExternalDocumentation;
  bindings?: MessageBindings;
  examples?: Array<MessageExample>;
  traits?: Array<MessageTrait | ReferenceObject>;
}

export interface MessageExample {
  name?: string;
  summary?: string;
  payload?: any;
  headers?: Record<string, any>;
}

// Components Object
export interface Components {
  schemas?: Record<string, Schema | ReferenceObject>;
  messages?: Record<string, Message | ReferenceObject>;
  parameters?: Record<string, Parameter | ReferenceObject>;
  correlationIds?: Record<string, CorrelationId | ReferenceObject>;
  operationTraits?: Record<string, OperationTrait | ReferenceObject>;
  messageTraits?: Record<string, MessageTrait | ReferenceObject>;
  serverBindings?: Record<string, ServerBindings | ReferenceObject>;
  channelBindings?: Record<string, ChannelBindings | ReferenceObject>;
  operationBindings?: Record<string, OperationBindings | ReferenceObject>;
  messageBindings?: Record<string, MessageBindings | ReferenceObject>;
  securitySchemes?: Record<string, SecurityScheme | ReferenceObject>;
}

// Schema Object (JSON Schema)
export interface Schema {
  type?: string | string[];
  title?: string;
  description?: string;
  format?: string;
  default?: any;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: boolean | number;
  minimum?: number;
  exclusiveMinimum?: boolean | number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  enum?: any[];
  properties?: Record<string, Schema | ReferenceObject>;
  additionalProperties?: boolean | Schema | ReferenceObject;
  items?: Schema | ReferenceObject | Array<Schema | ReferenceObject>;
  allOf?: Array<Schema | ReferenceObject>;
  oneOf?: Array<Schema | ReferenceObject>;
  anyOf?: Array<Schema | ReferenceObject>;
  not?: Schema | ReferenceObject;
  discriminator?: Discriminator;
  readOnly?: boolean;
  writeOnly?: boolean;
  example?: any;
  deprecated?: boolean;
  [key: string]: any; // For additional keywords
}

export interface Discriminator {
  propertyName: string;
  mapping?: Record<string, string>;
}

// Parameter Object
export interface Parameter {
  description?: string;
  schema?: Schema | ReferenceObject;
  location?: string;
}

// Correlation ID Object
export interface CorrelationId {
  description?: string;
  location: string;
}

// Reference Object
export interface ReferenceObject {
  $ref: string;
  summary?: string;
  description?: string;
}

// Security Scheme Object
export type SecurityScheme =
  | ApiKeySecurityScheme
  | HttpSecurityScheme
  | OAuth2SecurityScheme
  | OpenIdConnectSecurityScheme;

export interface ApiKeySecurityScheme {
  type: "apiKey";
  name: string;
  in: "query" | "header" | "cookie" | "user" | "password";
  description?: string;
}

export interface HttpSecurityScheme {
  type: "http";
  scheme: string;
  bearerFormat?: string;
  description?: string;
}

export interface OAuth2SecurityScheme {
  type: "oauth2";
  flows: OAuthFlows;
  description?: string;
}

export interface OpenIdConnectSecurityScheme {
  type: "openIdConnect";
  openIdConnectUrl: string;
  description?: string;
}

export interface OAuthFlows {
  implicit?: OAuthFlow;
  password?: OAuthFlow;
  clientCredentials?: OAuthFlow;
  authorizationCode?: OAuthFlow;
}

export interface OAuthFlow {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, string>;
}

// Security Requirement Object
export type SecurityRequirement = Record<string, string[]>;

// Tag Object
export interface Tag {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
}

// External Documentation Object
export interface ExternalDocumentation {
  url: string;
  description?: string;
}

// Reference Types
export interface ServerReference {
  serverName: string;
}

export interface ChannelReference {
  channelId: string;
}

export interface MessageReference {
  messageId: string;
}

export interface ParameterReference {
  parameterId: string;
}

// Trait Objects
export interface OperationTrait {
  title?: string;
  summary?: string;
  description?: string;
  security?: Array<SecurityRequirement>;
  tags?: Tag[];
  externalDocs?: ExternalDocumentation;
  bindings?: OperationBindings;
}

export interface MessageTrait {
  title?: string;
  summary?: string;
  description?: string;
  contentType?: string;
  tags?: Tag[];
  externalDocs?: ExternalDocumentation;
  bindings?: MessageBindings;
  examples?: Array<MessageExample>;
}

// Binding Objects (interface placeholders - actual implementations depend on the protocol)
export interface ServerBindings {
  [key: string]: any;
}

export interface ChannelBindings {
  [key: string]: any;
}

export interface OperationBindings {
  [key: string]: any;
}

export interface MessageBindings {
  [key: string]: any;
}

// Protocol-specific bindings for MQTT (as an example)
export interface MqttServerBinding {
  clientId?: string;
  cleanSession?: boolean;
  lastWill?: MqttLastWill;
  keepAlive?: number;
  sessionExpiryInterval?: number;
  maximumPacketSize?: number;
}

export interface MqttLastWill {
  topic: string;
  qos?: 0 | 1 | 2;
  message?: string;
  retain?: boolean;
}

export interface MqttOperationBinding {
  qos?: 0 | 1 | 2;
  retain?: boolean;
  bindingVersion?: string;
}

export interface MqttChannelBinding {
  topic?: string;
  bindingVersion?: string;
}

// Utility Types

// Make all properties in T optional
export type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends object ? PartialDeep<T[P]> : T[P];
};

// Creating a fully typed AsyncAPI document would use this type
export type TypedAsyncAPIDocument = PartialDeep<AsyncAPIDocument>;
