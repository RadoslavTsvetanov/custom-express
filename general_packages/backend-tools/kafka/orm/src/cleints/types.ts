
export type Config<Topics extends ChannelsDefault> = {
    [Topic in keyof Topics]?: (v: Topics[Topic]) => Promise<void>;
  };
  
  export type Options = {
    group: string;
    clientId: string;
    brokers: string[] /* in the fufutre implement a context safe type here*/;
  };


import type { ZodObject, ZodRawShape } from "zod";

export type DefaultZodObject = ZodObject<ZodRawShape>;

export type Message<T extends DefaultZodObject> = {
    data: T;
};

export type DefaultMessage = Message<DefaultZodObject>;

export type Channel<T extends Record<string, DefaultMessage>> = T;

export type DefaultChannel = Channel<Record<string, DefaultMessage>>;

export type ChannelsDefault = Record<string, DefaultChannel>;