import { WebSocketServer, WebSocket } from "ws";
import { z, ZodObject, type ZodRawShape } from "zod";
import { BetterArray, entries, GetSet, ifNotNone, keyofonlystringkeys, map, Optionable, panic, Port, VCallback, WebsocketUrl } from "@custom-express/better-standard-library"
import { HookBuilder } from "../utilites/builders/HookBuilder";
import { Hook, HookOrderedRecord, HookOrderedRecordEntry, ServerHooks } from "../../types/Hooks/main";
import { ChannelConfig } from "../../types/Channel/main";
import { TypedMessage } from "../../types/Message/main";
import { runHookHandler, runOrderedHooks } from "./helpers";
import { WebsocketClient } from "../../client";


// ---------
// This is the core class with only domain/bussiness logic e.g. without any utilities like map pipe etc... to see them go below to CustomWebsocketRouter where they are implemented i decided
// --------
export class CustomWebSocketRouter<
  ChannelNames extends string,
  Channels extends Record<
    ChannelNames,
    ChannelConfig<infer T, infer U>
  >,
  Context extends Record<ContextKeys, unknown>,
  ContextKeys extends string,
  BeforeHandle extends Hook<TypedMessage<unknown, unknown>>,
  Hooks extends ServerHooks<BeforeHandle, unknown>,
  LastHookReturnType extends Record<string, unknown> = {
    headers: { [x: string]: Optionable<string> };
  },
  LastHook extends (v: unknown) => LastHookReturnType = (v: {
    headers: { [x: string]: Optionable<string> };
  }) => LastHookReturnType,
  BaseRequest = {}
> {
  public readonly prefix: GetSet<Optionable<string>>

  Prefix(prefix: string): (typeof this.prefix)["value"] extends string ? never : this { // this is because you cant set a second prefix to an instance // TODO mamke it so that in the future when you prefix it does not return an instance on which you can call prefix at all
    this.prefix.setV(new Optionable(prefix))
    return this
  }
  protected context: Context = {} as Context; // make private later
  protected readonly channels: Channels;
  public hooks: Optionable<GlobalHooks>;

  constructor(endpoints: Channels, context?: Context) {
    this.channels = endpoints ?? ({} as Channels);
  }

  public plug<
    NewChannelNames extends string,
    NewChannels extends Record<
      NewChannelNames,
      ChannelConfig<
        any,
        any,
        {
          validate: ZodObject<ZodRawShape>;
          validateResponse: ZodObject<ZodRawShape>;
        }
      >
    >,
    NewContext extends Record<ContextKeys, unknown>,
    NewContextKeys extends string
  >(
    app: CustomWebSocketRouter<ChannelNames, Channels, Context, ContextKeys>
  ): CustomWebSocketRouter<ChannelNames | NewChannelNames, Channels & NewChannels, Context & NewContext, ContextKeys & NewContextKeys> {
    // Merging logic can be added here if necessary
    // For example, copying handlers or other properties from `app` to this instance

    // Return a new instance of CustomWebSocketRouter
    return new CustomWebSocketRouter
      ({
        ...this.channels,
        ...app.channels
      }, {
        ...this.context,
        ...app.context
      });
  }


  private sendUnprocessableMessageType(
    ws: WebSocket,
    invocationInfo: { channel: string; msg: object; handler: string }
  ) {
    ws.send(
      JSON.stringify({
        error: "Cannot find handler to process message",
        invocationData: invocationInfo,
      })
    );
  }

  private transformMsg(
    v: string
  ): Optionable<
    TypedMessage<keyofonlystringkeys<Channels[keyof Channels]>, unknown>
  > {
    try {
      return new Optionable(JSON.parse(v));
    } catch {
      return new Optionable<
        TypedMessage<keyofonlystringkeys<Channels[keyof Channels]>, unknown>
      >(null);
    }
  }

  store<T extends Record<string, unknown>>(
    object: T
  ): CustomWebSocketRouter<
    ChannelNames,
    Channels,
    Context & typeof object,
    ContextKeys & keyof T
  > {
    return new CustomWebSocketRouter(this.channels, {
      ...this.context,
      ...object,
    });
  }

start(port: Port) {
  new Map(Object.entries(this.channels)).forEach((channelHandlers) => {
    new Optionable(channelHandlers)
      .unpack("handlers not defined")
      .map((handlers) => {
        const wss = new WebSocketServer({ port: port.value });

        wss.on("connection", (ws, req) => {
          this.hooks.ifCanBeUnpacked(({ onConnection }) => {
            runHookHandler(onConnection, { ws, message: req });
          });

          ws.on("message", async (message) => {
            // TODO: Add a hook here to intercept message pre-parsing

            this.transformMsg(message.toString()).try({
              ifNone: () => {
                this.sendUnprocessableMessageType(ws, {
                  channel: "unknown",
                  handler: "onMessageReceived",
                  msg: {},
                });
              },

              ifNotNone: async (parsedMessage) => {
                try {
                  this.hooks.ifCanBeUnpacked(({ beforeHandle }) => {
                    beforeHandle.map((hook) => {
                      runHookHandler(hook, { ws, message: parsedMessage });
                    });
                  });

                  new Optionable(
                    BetterArray.new(Object.entries(this.channels))
                      .filter(([channelName]) => channelName === parsedMessage.channel)
                      .normalArray[0]
                  ).try({
                    ifNone: () =>
                      console.log(`No open channel called ${parsedMessage.channel}`, parsedMessage),

                    ifNotNone: ([channelName, channelConfig]) => {
                      new Optionable(
                        channelConfig.messagesItCanReceive[parsedMessage.message]
                      ).try({
                        ifNone: () =>
                          console.log(`Channel ${channelName} does not accept message type ${parsedMessage.message}`),

                        ifNotNone: ({ config, parse }) => {
                          config.map(({ handler, hooks: { beforeHandler, afterHandler } }) => {
                            runHookHandler(beforeHandler, { ws, message: parsedMessage });

                            const result = handler(parse({ ws, message: parsedMessage }));

                            runHookHandler(afterHandler, { ws, message: result });

                            this.hooks.ifCanBeUnpacked(({ afterHandle }) => {
                              afterHandle.map((hook) => {
                                runHookHandler(hook, { ws, msg: result });
                              });
                            });
                          });
                        },
                      });
                    },
                  });
                } catch (err) {
                  this.hooks.ifCanBeUnpacked(({ onError }) => onError(err));
                }
              },
            });
          });

          ws.on("close", (code, reason) => {
            this.hooks.ifCanBeUnpacked(({ onClose }) => {
              runHookHandler(onClose, {
                ws,
                message: { code, reason: reason.toString() },
              });
            });
          });
        });
      });
  });
}


  getCLientBuilder(url: WebsocketUrl) {
    return new WebsocketClient<ChannelNames, Channels, {}>(url, this.channels);
  }

  // it hahves like elysia plugins
  // usefull for adding big batches of context for example e,g, a big store which you have reused previously, for example all of services for interacting with a auth provider which you are reusing

  addChannel<
    NewName extends string,
    MessagesItCanSend extends string,
  MessagesItCanReceive extends string>(config: {
    name: NewName;
  }
    &
    ChannelConfig<
      MessagesEntries<MessagesItCanSend,MessagesItCanReceive>,
      ServerHooks
    >

  ): NewName extends ChannelNames
    ? never
    : CustomWebSocketRouter<
      
  > {
    Object.entries(this.channels).forEach(([channelName, value]) => {
      if (channelName === config.name) {
        panic(`Channel ${channelName} is already defined`)
      }
    })

    return new CustomWebSocketRouter<ChannelNames | NewName, Channels & typeof config.handlers, Context, ContextKeys>({
      ...
    })
  }

}


