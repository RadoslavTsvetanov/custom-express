import { ZodObject, ZodRawShape } from "zod";
import { Hook, HookOrderedRecord, HookOrderedRecordEntry, ServerHooks } from "../Hooks/main";
import { MessageItCanReceive, MessagesEntries, MessageThatCanBeSent } from "../Message/main";
import { UnknownRecord } from "@custom-express/better-standard-library/src/types/unknwonString";

export type ChannelConfig<
  MessagesItCanSend extends Record<string, MessageThatCanBeSent<ZodObject<ZodRawShape>>>,
  MessagesItCanReceive extends Record<
    string,
    MessageItCanReceive<
      HookOrderedRecord<HookOrderedRecordEntry[]>,
      ZodObject<ZodRawShape>
    >
  >,
  Hooks extends ServerHooks<
      Hook<unknown, UnknownRecord>,
      Hook<unknown, UnknownRecord>,
      string
    >
  > = {
  messagesItCanReceive: MessagesItCanReceive,
    messagesItCanSend: MessagesItCanSend,
    hooks: Hooks
};

