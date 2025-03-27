import type { ZodSchema } from "zod";

export interface TypedMessage<T extends string, D> {
  type: T;
  data: D;
}

  
  export interface ChannelConfig<
    TSend extends Record<keyof TSend, ZodSchema>,
    TReceive extends Record<keyof TReceive, ZodSchema>
  > {
    messagesItCanSend: TSend;
    messagesItCanReceive: TReceive;
  }

