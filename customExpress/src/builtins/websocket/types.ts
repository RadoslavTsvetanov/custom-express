import  { z, ZodSchema, ZodUnknown } from "zod";

export interface TypedMessage<T extends string, D> {
  channel: T
  message: string 
  payload: D;
}



  
export interface ChannelConfig<
    TSend extends Record<keyof TSend, ZodSchema & Hooks["validateResponse"]>,
    TReceive extends Record<keyof TReceive, ZodSchema & Hooks["validate"]>,
  Hooks extends {
      validate: ZodSchema;// this checks for incoming messages for all handlers of a group 
      // transform<TransformReturn>(data: ZodSchema): TransformReturn;
      validateResponse: ZodSchema // this is for a validator which checks all responses from a server group handlers
  } 
  > {
    messagesItCanSend: TSend;
  messagesItCanReceive: TReceive;
  hooks: Hooks
  }

