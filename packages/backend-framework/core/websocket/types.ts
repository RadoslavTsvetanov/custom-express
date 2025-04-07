import { OrderedRecord, URecord, With } from "@custom-express/better-standard-library";
import { z, ZodSchema, ZodUnknown } from "zod";
import { IncomingMessage } from 'http';

// -------------------------------------
// Utility Types
// -------------------------------------

type Handler<Context, ReturnType> = (context: Context) => ReturnType;
type WithKey<T extends URecord> = With<T, "key", string>;

// A generic hook handler function type
type HookHandler<ReturnType, MessageType> = (ctx: {
  ws: WebSocket;
  message: MessageType;
}) => ReturnType;

// A handler that operates independently (not composed in a pipeline)
type IndependentHandler<MessageType> = HookHandler<Promise<void>, MessageType>;

// -------------------------------------
// Message & Channel Types
// -------------------------------------

export interface TypedMessage<ChannelNames extends string, Payload> {
  channel: ChannelNames;
  message: string;
  payload: Payload;
}

type MessageHandler<ContextType, ReturnType> = {
  hooks: ServerHooks<
    OrderedRecord<[], WithKey<{ execute: Handler<unknown, unknown> }>>,
    OrderedRecord<[], WithKey<{ execute: Handler<unknown, unknown> }>>, string>;
  handler: Handler<ContextType,ReturnType>; // if nothing is return from a handler its simpley that after hooks wont be ran  
};

export type ChannelConfig<Messages extends string> = {
  [Message in Messages]: MessageHandler<unknown, unknown>;
};

// -------------------------------------
// Hook Types
// -------------------------------------

type Hook<IndependentHandlersContext> = {
  // For composing transformations sequentially
  ordered: OrderedRecord<[], WithKey<{handler: HookHandler<unknown,IncomingMessage>}>>;

  // For running independent handlers (e.g. logging, side effects)
  independent: IndependentHandler<IndependentHandlersContext>[];
};

export type GlobalOnlyHooks = {
  onClose: Hook<{code: number, reason: string}>
  // Triggered right after WebSocket connection
  onConnection: Hook<IncomingMessage>;
};

// -------------------------------------
// Server Hook System
// -------------------------------------

export type ServerHooks<
  BeforeRequest extends OrderedRecord<
    [],
    WithKey<{ execute: Handler }>> = OrderedRecord<[], WithKey<{ execute: Handler<unknown, unknown> }>
    >,
  AfterRequest extends OrderedRecord<
    [],
    WithKey<{execute: Handler }>> = OrderedRecord<[], WithKey<{ execute: Handler<unknown, unknown> }>>,
  Errors extends string = string
> = {
  beforeRequest:  Hook<TypedMessage<unknown, unknown>>  /* BeforeRequest */;
  afterRequest: Hook<TypedMessage<unknown, unknown>>/* AfterRequest */;
  onError: (error: Errors) => void;
};

// -------------------------------------
// Global Hook Config
// -------------------------------------

export type GlobalHooks = GlobalOnlyHooks & ServerHooks;
