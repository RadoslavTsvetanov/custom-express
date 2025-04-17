import { AfterfixKeysOfRecord, Last, OrderedRecord } from "@custom-express/better-standard-library";
import { ZodObject, ZodRawShape } from "zod";
import { BaseHookBundle, Hook, HookOrderedRecord, HookOrderedRecordBase, HookOrderedRecordEntry, MessageHooks, ServerHooks } from "../Hooks/main";

export interface TypedMessage<ChannelNames extends string, Payload> {
  channel: ChannelNames;
  message: string;
  payload: Payload;
}

export type Handler<Context, ReturnType> = (context: Context) => ReturnType;

export interface MessageHandler<
  HandlerReturnType,
  Hooks extends MessageHooks< 
    Hook<unknown,HookOrderedRecordBase>,
    Hook<unknown,HookOrderedRecordBase>
    >
>   /* extends ITrueMap<MessageHandler<ContextType, ReturnType, unknown>> */ {
  hooks: Hooks
  handler: Handler<ReturnType<Last<Hooks["beforeHandler"]["ordered"]["elements"]["value"]>["execute"]> ,HandlerReturnType>; // if nothing is return from a handler its simpley that after hooks wont be ran  
};

export type MessagesEntries<MessagesItCanSend extends string, MessagesItCanReceive extends string> = {
  messagesItCanSend: MessagesItCanSend,
  messagesItCanReceive: MessagesItCanReceive
}

export type MessageThatCanBeSent<Schema extends ZodObject<ZodRawShape>> = Schema

export type MessageItCanReceive<
    Hooks extends MessageHooks<BaseHookBundle, BaseHookBundle>,
    ReturnType
  > = {
  config: MessageHandler<ReturnType, Hooks>,
}

