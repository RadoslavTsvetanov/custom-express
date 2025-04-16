import { ITrueMap, OrderedRecord, OrderedRecordBase } from "@custom-express/better-standard-library";
import { WithKey } from "../main";
import { Handler, TypedMessage } from "../Message/main";
import {IncomingMessage} from "http"
import { UnknownRecord } from "@custom-express/better-standard-library/src/types/unknwonString";

export type HookOrderedRecordEntry<T = unknown, U = unknown> = WithKey<{
  execute: Handler<T, U>;
}>;

export class HookOrderedRecord<
  Elements extends HookOrderedRecordEntry[]
  // for now you are not supposed to touch this
> extends OrderedRecord<Elements, HookOrderedRecordEntry> {}

// Example Usage 


{ // declaring new scope so that we can reuse names in the kater examples without the compiler being a bitch 
  const hooks = new HookOrderedRecord([{ key: "first", execute: () => { } }] as const).add({ key: "d", execute: () => 23 } as const)
  { // again to introduce it in a new scope so that i can later reuse these burner names
    const g = hooks.elements.value[0]
    // should be 
    // const g: {
    //     readonly key: "first";
    //     readonly execute: () => void;
    // }
  }

  {
    const g = hooks.elements.value[1]
//     should be const g: {
//     readonly key: "first";
//     readonly execute: () => void;
// }

  }

}

export type BaseHookBundle = Hook<unknown, HookOrderedRecordBase>



export interface Hook<EnteringContext, Mappers extends HookOrderedRecordBase> /* extends  ITrueMap<Hook<EnteringContext, Mappers>> */
{
  ordered: Mappers
  independent: IndependentHandler<EnteringContext>[];// For running independent handlers (e.g. logging, side effects)

};

export type GlobalOnlyHooks<
  OnCloseHooks extends HookOrderedRecordBase,
  OnConnectionHooke extends HookOrderedRecordBase
> = {
  onClose: Hook<{code: number, reason: string},OnCloseHooks>
  onConnection: Hook<IncomingMessage, OnConnectionHooke>;
};


export type ServerHooks<
  BeforeHandle extends Hook<TypedMessage<string, unknown>, HookOrderedRecordBase>,
  AfterHandle extends Hook<TypedMessage<string, unknown>, HookOrderedRecordBase>,
  Errors extends string = string
> = {
  beforeHandle:  BeforeHandle 
  afterHandle:  AfterHandle
  onError: (error: Errors) => void;
};


export type GlobalHooks =
  GlobalOnlyHooks<
    HookOrderedRecordBase,
    HookOrderedRecordBase
  >
  & ServerHooks<
    BaseHookBundle,
    BaseHookBundle
  >


type HookHandler<
  ReturnType,
  MessageType
> = (ctx: {
  ws: WebSocket;
  message: MessageType;
}) => ReturnType;

type IndependentHandler<MessageType> = HookHandler<Promise<void>, MessageType>;

export type HookOrderedRecordBase = HookOrderedRecord<HookOrderedRecordEntry[]>