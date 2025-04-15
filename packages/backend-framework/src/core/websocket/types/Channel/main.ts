import { ZodObject, ZodRawShape } from "zod";
import { HookOrderedRecordEntry, ServerHooks } from "../Hooks/main";
import { MessageItCanReceive, MessagesEntries, MessageThatCanBeSent } from "../Message/main";

export type ChannelConfig<
  Messages extends MessagesEntries<unknown, unknown>,
  Hooks extends ServerHooks<
      HookOrderedRecordEntry,
      HookOrderedRecordEntry,
      string
    >
  > = {
  messagesItCanReceive: {
      [Message in keyof Messages["messagesItCanReceive"]]: MessageItCanReceive<unknown, unknown>
  },
    messagesItCanSend: {
      [Message in keyof Messages["messagesItCanSend"]]: MessageThatCanBeSent<ZodObject<ZodRawShape>> 
    }
    
};

