import { OrderedRecord } from "@custom-express/better-standard-library";
import { WithKey } from "../main";
import { Handler } from "../Message/main";
import {IncomingMessage} from "http"

export type HookOrderedRecordEntry<T = unknown, U = unknown> = WithKey<{
  execute: Handler<T, U>;
}>;

export class HookOrderedRecord<
  Elements extends HookOrderedRecordEntry[]
  // for now you are not supposed to touch this
> extends OrderedRecord<Elements, HookOrderedRecordEntry> {}

export interface Hook<EnteringContext, Mappers extends > extends ITrueMap<Hook<EnteringContext>>
{
  ordered: OrderedRecord<
   /* ! make it so that the first aarguemnt of the hooks tuple is a hook that returns the */,
    WithKey<{ handler: HookHandler<unknown, { msg: IncomingMessage, ctx: EnteringContext }> }>>;

  // For running independent handlers (e.g. logging, side effects)
  independent: IndependentHandler<EnteringContext>[];
};

export type GlobalOnlyHooks = {
  onClose: Hook<{code: number, reason: string}>
  onConnection: Hook<IncomingMessage>;
};


export type ServerHooks<
  BeforeHandle extends Hook<TypedMessage<unknown, unknown>>,
  AfterHandle extends Hook<TypedMessage<unknown, unknown>>,
  Errors extends string = string
> = {
  beforeHandle:  BeforeHandle 
  afterHandle:  AfterHandle
  onError: (error: Errors) => void;
};


export type GlobalHooks = GlobalOnlyHooks & ServerHooks;


type HookHandler<
  ReturnType,
  MessageType
> = (ctx: {
  ws: WebSocket;
  message: MessageType;
}) => ReturnType;

type IndependentHandler<MessageType> = HookHandler<Promise<void>, MessageType>;

