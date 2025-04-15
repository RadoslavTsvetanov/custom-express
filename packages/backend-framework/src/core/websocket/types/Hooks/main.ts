import { ITrueMap, OrderedRecord } from "@custom-express/better-standard-library";
import { WithKey } from "../main";
import { Handler } from "../Message/main";
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





export interface Hook<EnteringContext, Mappers extends UnknownRecord> extends ITrueMap<Hook<EnteringContext>>
{
  ordered: HookOrderedRecord<unknown, unknown>
  independent: IndependentHandler<EnteringContext>[];// For running independent handlers (e.g. logging, side effects)

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

