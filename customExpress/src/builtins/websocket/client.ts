import type { WebsocketUrl } from "../../types/networking/urls/websocket";
import type { ChannelConfig } from "./types";
import type { z, ZodObject, ZodRawShape, ZodSchema } from "zod";
import { panic } from "../../utils/panic";
import { ifNotNone, Optionable } from "../../utils/better-returns/errors-as-values/src/rust-like-pattern/option";
import { logger } from "../../utils/better-returns/errors-as-values/src/utils/console";
import type { OrderedRecord } from "../../utils/better-standard-library/RecordCompatibeArray";

const hooks = ["before", "after"] as const;
type MakeHookType<T extends string> = `${T}Message`;
type HookTypes = MakeHookType<(typeof hooks)[number]>;
function afterfix(s: string) {
  return `${s}Message`;
}

type HooksEntry<HookNames, HandlerParamType, HandlerReturnType> = {
  key: HookNames;
  handler: (v: HandlerParamType) => HandlerReturnType;
  type: HookTypes;
};

// note unlike the WebsocketClient this does not reuse connection but establishes new ones each time start is called
class WebsocketListener<
  HookNames extends string,
  Hooks extends OrderedRecord<HookNames, HooksEntry<HookNames, object, object>[]>,
  LastHookReturnType extends Record<string, unknown> = {
    headers: { [x: string]: Optionable<string> };
  },
  LastHook extends (v: unknown) => LastHookReturnType = (v: {
    headers: { [x: string]: Optionable<string> };
  }) => LastHookReturnType
> {
  private handlers;
  private url: string;
  private endpoints;
  public hooks: Hooks;
  constructor(messageHandlers, url: WebsocketUrl, endpoints) {
    this.handlers = messageHandlers;
    this.url = url.value;
    this.endpoints = endpoints;
  }


  use(wsListener: WebsocketListener)

  public k() {
    return this.hooks.jojo
  }

  before<HookName extends HookNames, NewHookName extends string, >(v: {
    name: NewHookName
    nameOfHookWhichWeWantToBeBefore: HookName,
    // type: Hooks[HookName]["type"],
    handler: (v: Parameters<Hooks[HookName]["handler"]>[0]) => Parameters<Hooks[HookName]["handler"]>[0]
  }): WebsocketListener<
    HookNames | NewHookName,
    Hooks & HooksEntry<NewHookName, Parameters<Hooks[HookName]["handler"]>[0], NewHookReturnType>,
    LastHookReturnType,
    LastHook
  > {
    const newHookType = this.hooks[v.nameOfHookWhichWeWantToBeBefore].type

    this.hooks
  
  return 
  }


  hook<
    HookReturnTypeKeys extends string,
    HookName extends string,
    HookReturnType extends { [K in HookReturnTypeKeys]: unknown }
  >(v: {
    name: HookName /* extends HookNames ? never : HookName */ ;
    type: HookTypes;
    handler: (v: LastHookReturnType) => HookReturnType;
  }): HookName extends ""
    ? never
    // : HookName extends HookNames
    // ? never
    :  WebsocketListener<
        HookNames | HookName,
        OrderedRecord<HookNames | HookName, [...Hooks["getElementsType"],HooksEntry<HookNames & HookName, LastHookReturnType, HookReturnType>]>,
        HookReturnType,
        (v: LastHookReturnType) => HookReturnType
      > {
    if (v.name === "") {
      panic("hook name cant be  an empty string");
    }
    if (!hooks.some((hook) => afterfix(hook) === v.type)) {
      panic(
        `hook type ${
          v.type
        } is not accepted, currently accepted are ${JSON.stringify(hooks)}`
      );
    }

    return;
  }

  start() {
    const ws = new WebSocket(this.url);
    ws.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      const { channel, message, payload } = data;

      if (this.handlers[channel] && this.handlers[channel][message]) {
        const { handler, unsafe } = this.handlers[channel][message];

        if (
          unsafe ||
          (unsafe === undefined &&
            this.endpoints[channel].messagesItCanReceive[message].unsafe ===
              false)
        ) {
          await handler(payload);
        } else {
          panic(`Unsafe message received: ${channel}.${message}`);
        }
      } else {
        panic(`Unhandled message: ${channel}.${message}`);
      }
    };
  }
}
// we make this class so that when you define a listener it does not start automaticcaly but when you tell it to

export class WebsocketClient<
  ChannelNames extends string,
  E extends Record<
    ChannelNames,
    ChannelConfig<
      any,
      any,
      {
        validate: ZodObject<ZodRawShape>;
        validateResponse: ZodObject<ZodRawShape>;
      }
    >
  >,
  Context extends Record<string, unknown>
> {
  private url: WebsocketUrl;
  public ws: WebSocket;
  private endpoints: E;
  private context: Context;

  constructor(url: WebsocketUrl, endpoints: E, context?: Context) {
    this.url = url;
    this.endpoints = endpoints;
    this.context = new Optionable(context).unpack_with_default({} as Context);
    console.log("ooo", JSON.stringify(this.url.valueOf()));
    this.ws = new WebSocket(this.url.value);

    this.ws.onopen = () => {
      // this.ws.send("data")
      console.log("WebSocket connected:", this.url);
    };
    this.ws.onerror = (err) => console.error("WebSocket error:", err);
  }

  setupListeners<Exhaustive extends true | false>( // it is true | false instead of boolean since if it is true or false we can pass them as type values while if it is as a bool it will be apssed as a value not type so we cant check which one was passed, Made it as a simple builder
    messageReceivers: Exhaustive extends true
      ? {
          [Channel in keyof E]: {
            [Message in keyof E[Channel]["messagesItCanSend"]]: {
              handler: (
                d: z.infer<E[Channel]["messagesItCanSend"][Message]>
              ) => Promise<void>;
              unsafe?: boolean;
            };
          };
        }
      : {
          [Channel in keyof E]?: {
            [Message in keyof E[Channel]["messagesItCanSend"]]?: {
              handler: (
                d: z.infer<E[Channel]["messagesItCanSend"][Message]>
              ) => Promise<void>;
              unsafe?: boolean;
            };
          };
        }
  ) {
    this.ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data.toString());
        const { channel, message, payload } = data as {
          channel: keyof E;
          message: keyof E[keyof E]["messagesItCanSend"];
          payload: unknown;
        };

        const channelAcceptedMessages = new Optionable<{
          [Message in E[typeof channel]["messagesItCanSend"]]: E[typeof channel]["messagesItCanReceive"][Message];
        }>(messageReceivers[channel]);

        channelAcceptedMessages.try({
          ifNone: () => {
            logger.log(
              "didnt find handler for this message" +
                JSON.stringify(data) +
                "\n" +
                "see if are using exhaustive false on the generate handler"
            );
          },
          ifNotNone: async (channelAcceptedMessages) => {
            if (
              !(channel in messageReceivers) ||
              !(message in channelAcceptedMessages)
            ) {
              console.warn("Unhandled message:", data);
              return;
            }

            const receiver = channelAcceptedMessages[message];

            try {
              this.endpoints[channel].messagesItCanSend[message].parse(payload);
              await receiver.handler(payload);
            } catch (e) {
              if (receiver.unsafe) {
                console.log(
                  "Unsafe mode enabled: Processing invalid message:",
                  JSON.stringify(payload)
                );
                await receiver.handler(payload);
              } else {
                console.error("Message validation failed:", e);
              }
            }
          },
        });
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
  }

  getReusableListener(messageReceivers: {
    [Channel in keyof E]: {
      [Message in keyof E[Channel]["messagesItCanSend"]]: {
        handler: (
          d: z.infer<E[Channel]["messagesItCanSend"][Message]>
        ) => Promise<void>;
        unsafe?: boolean;
      };
    };
  }) {
    return new WebsocketListener(messageReceivers, this.url, this.endpoints);
  }

  generateClient(): {
    [Channel in keyof E]: {
      [Message in keyof E[Channel]["messagesItCanReceive"]]: (
        d: z.infer<E[Channel]["messagesItCanReceive"][Message]>
      ) => void;
    };
  } {
    const client: any = {};
    Object.entries(this.endpoints).forEach(([channelName, channelConfig]) => {
      client[channelName] = {};

      Object.entries(channelConfig.messagesItCanReceive).forEach(
        ([messageName, schema]) => {
          client[channelName][messageName] = async (
            data: z.infer<typeof schema>
          ) => {
            try {
              const newws = new WebSocket(this.url.value); // horrible performance if possible make it all thingd from this class to reuse one connection so that one clientInsyance is one connection
              newws.onopen = () => {
                schema.parse(data);
                newws.send(
                  JSON.stringify({
                    channel: channelName,
                    message: messageName,
                    payload: data,
                    context: this.context, // Include context in messages
                  })
                );
              };
              console.log("after");
            } catch (error) {
              console.error(
                `Invalid message format for ${messageName}:`,
                error
              );
            }
          };
        }
      );
    });

    return client;
  }
}



class ExtendedWebsocketListener<
  HookNames extends string,
  Hooks extends OrderedRecord<HookNames, HooksEntry<HookNames, unknown, unknown>[]>,
  LastHookReturnType extends Record<string, unknown>,
  LastHook extends (v: unknown) => LastHookReturnType
> extends WebsocketListener<HookNames, Hooks, LastHookReturnType, LastHook> {
  constructor(
    messageHandlers: any,
    url: WebsocketUrl,
    endpoints: any
  ) {
    super(messageHandlers, url, endpoints);
  }


  guard(v: {
    schema: ZodObject<ZodRawShape>,
    name: string,
    type: HookTypes,
    config?: {
      handlerOnFailedValidation: (v: LastHookReturnType) => void // = (v) => {console.log(JSON.stringify(v), "didnot pass guard")} //TODO:  in the future make it so that it just sends an error message and closes the connection
    }  
  }) {
    return this.hook({
      ...v,
      handler: ctx => {
        const validationResult = v.schema.partial().safeParse(v)
        if (validationResult.success) {
          return v
        } 
        ifNotNone(v.config, (c => c.handlerOnFailedValidation(ctx)))
        throw new Error("")


      } 
    })
  }

  match(v: {// match is helpful when you want to defend from extra fields, for example to protect from params pollution

    schema: ZodObject<ZodRawShape>,
    name: string,
    type: HookTypes,
    config?: {
      handlerOnFailedValidation: (v: LastHookReturnType) => void // = (v) => {console.log(JSON.stringify(v), "didnot pass guard")} //TODO:  in the future make it so that it just sends an error message and closes the connection
    } 
  }) {
    return this.hook({
      ...v,
      handler: ctx => {
        const validationResult = v.schema.strict().safeParse(v)
        if (validationResult.success) {
          return v
        } 
        ifNotNone(v.config, (c => c.handlerOnFailedValidation(ctx)))
        throw new Error("")


      } 
    })
  }

}

export { WebsocketListener };
