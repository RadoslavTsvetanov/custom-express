import { AfterfixKeysOfRecord, OrderedRecord } from "@custom-express/better-standard-library";
import { ZodObject, ZodRawShape } from "zod";
import { BaseHookBundle, Hook, HookOrderedRecord, HookOrderedRecordBase, HookOrderedRecordEntry, MessageHooks, ServerHooks } from "../Hooks/main";

export interface TypedMessage<ChannelNames extends string, Payload> {
  channel: ChannelNames;
  message: string;
  payload: Payload;
}

export type Handler<Context, ReturnType> = (context: Context) => ReturnType;

export interface MessageHandler<
  ContextType, // this is for passing the type hich the last beforeHAnle returns for dev purposes it is a seperate type however in future releases remove it to remove redundnadncy 
  ReturnType,
  Hooks extends MessageHooks< 
    Hook<unknown,HookOrderedRecordBase>,
    Hook<unknown,HookOrderedRecordBase>
    >
>   /* extends ITrueMap<MessageHandler<ContextType, ReturnType, unknown>> */ {
  hooks: Hooks
  handler: Handler</* Hooks["beforeHandler"]["ordered"]["lastElement"] */ ContextType ,ReturnType>; // if nothing is return from a handler its simpley that after hooks wont be ran  
};

export type MessagesEntries<MessagesItCanSend extends string, MessagesItCanReceive extends string> = {
  messagesItCanSend: MessagesItCanSend,
  messagesItCanReceive: MessagesItCanReceive
}

export type MessageThatCanBeSent<Schema extends ZodObject<ZodRawShape>> = Schema

export type MessageItCanReceive<
    Hooks extends HookOrderedRecord<HookOrderedRecordEntry[]>,
    Schema extends ZodObject<ZodRawShape>
  > = {
  config: MessageHandler<unknown, unknown, MessageHooks<BaseHookBundle, BaseHookBundle>>,
  parse: Schema
}

