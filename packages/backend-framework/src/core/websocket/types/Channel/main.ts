import { ZodObject, ZodRawShape } from "zod";
import { BaseHookBundle, BaseMessageHooks, Hook, HookOrderedRecord, HookOrderedRecordEntry, MessageHooks, ServerHooks } from "../Hooks/main";
import { MessageItCanReceive, MessagesEntries, MessageThatCanBeSent } from "../Message/main";
import { UnknownRecord } from "@custom-express/better-standard-library/src/types/unknwonString";

export type ChannelConfig<
  MessagesItCanSend extends Record<string, MessageThatCanBeSent<ZodObject<ZodRawShape>>>,
  MessagesItCanReceive extends Record<
    string,
    MessageItCanReceive<
      BaseMessageHooks,
      unknown
    >
  >,
  Hooks extends Partial<ServerHooks<
      BaseHookBundle,
      BaseHookBundle,
      string
    >>
  > = {
  messagesItCanReceive: MessagesItCanReceive,
    messagesItCanSend: MessagesItCanSend,
    hooks: Hooks
};

