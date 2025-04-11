import { AfterfixKeysOfRecord, ITrueMap, OrderedRecord, URecord, With } from "@custom-express/better-standard-library";
import { z, ZodObject, ZodRawShape, ZodSchema, ZodUnknown } from "zod";
import { IncomingMessage } from 'http';

// -------------------------------------
// Utility Types
// -------------------------------------

type HookOrderedRecordEntry<T = unknown,U = unknown> =  WithKey<{ execute: Handler<T, U> }>

export class HookOrderedRecord<
  Elements extends HookOrderedRecordEntry[],
  // for now you are not supposed to touch this
> extends OrderedRecord<Elements,HookOrderedRecordEntry>{ }

export type Handler<Context, ReturnType> = (context: Context) => ReturnType;
type WithKey<T extends URecord> = With<T, "key", string>;

type HookHandler<
  ReturnType,
  MessageType
> = (ctx: {
  ws: WebSocket;
  message: MessageType;
}) => ReturnType;

type IndependentHandler<MessageType> = HookHandler<Promise<void>, MessageType>;

// -------------------------------------
// Message & Channel Types
// -------------------------------------

export interface TypedMessage<ChannelNames extends string, Payload> {
  channel: ChannelNames;
  message: string;
  payload: Payload;
}

interface MessageHandler<
  ContextType, // this is for passing the type hich the last beforeHAnle returns
  ReturnType,
  Hooks extends AfterfixKeysOfRecord<ServerHooks<
    OrderedRecord<[], HookOrderedRecordEntry>,
    OrderedRecord<[], HookOrderedRecordEntry>, string
    >, "r">
>   /* extends ITrueMap<MessageHandler<ContextType, ReturnType, unknown>> */ {
  hooks: Hooks
  handler: Handler<Hooks["beforeHandler"]["ordered"]["lastElement"],ReturnType>; // if nothing is return from a handler its simpley that after hooks wont be ran  
};

export type MessagesEntries<MessagesItCanSend extends string, MessagesItCanReceive extends string> = {
  messagesItCanSend: MessagesItCanSend,
  messagesItCanReceive: MessagesItCanReceive
}

export type ChannelConfig<
  Messages extends MessagesEntries<unknown, unknown>,
  Hooks extends ServerHooks<
    OrderedRecord<[], HookOrderedRecordEntry>,
    OrderedRecord<[], HookOrderedRecordEntry>, string
    >
  > = {
  messagesItCanReceive: {
    [Message in keyof Messages["messagesItCanReceive"]]: {
      config: MessageHandler<unknown, unknown, Hooks>,
      parse: ZodObject<ZodRawShape>
    }
  }
    messagesItCanSend: {
      [Message in keyof Messages["messagesItCanSend"]]: ZodObject<ZodRawShape>
    }
    
};

// -------------------------------------
// Hook Types
// -------------------------------------



interface Hook<EnteringContext > extends ITrueMap<Hook<EnteringContext>>
{
  ordered: OrderedRecord<[WithKey<{handler: HookHandler<EnteringContext, unknown>}>] /* ! make it so that the first aarguemnt of the hooks tuple is a hook that returns the */, WithKey<{handler: HookHandler<unknown,{msg: IncomingMessage, ctx: EnteringContext}>}>>;

  // For running independent handlers (e.g. logging, side effects)
  independent: IndependentHandler<EnteringContext>[];
};

export type GlobalOnlyHooks = {
  onClose: Hook<{code: number, reason: string}>
  onConnection: Hook<IncomingMessage>;
};

// -------------------------------------
// Server Hook System
// -------------------------------------

export type ServerHooks<
  BeforeHandle extends Hook<TypedMessage<unknown, unknown>>,
  AfterHandle extends Hook<TypedMessage<unknown, unknown>>,
  Errors extends string = string
> = {
  beforeHandle:  BeforeHandle 
  afterHandle:  AfterHandle
  onError: (error: Errors) => void;
};

// -------------------------------------
// Global Hook Config
// -------------------------------------

export type GlobalHooks = GlobalOnlyHooks & ServerHooks;


