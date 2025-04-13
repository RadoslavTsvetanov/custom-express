
export type ChannelConfig<
  Messages extends MessagesEntries<unknown, unknown>,
  Hooks extends ServerHooks<
    OrderedRecord<[], HookOrderedRecordEntry>,
    OrderedRecord<[], HookOrderedRecordEntry>, string
    >
  > = {
  messagesItCanReceive: {
      [Message in keyof Messages["messagesItCanReceive"]]: MessageItCanReceive<unknown, unknown>
  },
    messagesItCanSend: {
      [Message in keyof Messages["messagesItCanSend"]]: MessageThatCanBeSent<ZodObject<ZodRawShape>> 
    }
    
};

