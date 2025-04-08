import { id } from './../../../../../apps/train-y/backend/types/id';
import { WebSocketServer, WebSocket } from "ws";
import { z, ZodObject, type ZodRawShape } from "zod";
import { BetterArray, entries, GetSet, ifNotNone, keyofonlystringkeys, Optionable, panic, Port, VCallback } from "@custom-express/better-standard-library"
import { ChannelConfig, GlobalHooks, GlobalOnlyHooks, Handler, ServerHooks, TypedMessage } from "../types";


// ---------
// This is the core class with only domain/bussiness logic e.g. without any utilities like map pipe etc... to see them go below to CustomWebsocketRouter where they are implemented i decided
// --------



export class CustomWebSocketRouter<
  ChannelNames extends string,
  Channels extends Record<
    ChannelNames,
    ChannelConfig<unknown>
  >,
  Context extends Record<ContextKeys, unknown>,
  ContextKeys extends string,

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
  protected hooks: Optionable<GlobalHooks>;

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
    new Map(Object.entries(this.channels)).forEach((handlers) => {
      new Optionable(handlers)
        .unpack("handlers not defined")
        .map((handlers) => {
          const wss = new WebSocketServer({ port: port.value });

          wss.on("connection", (ws, req) => {

            this.hooks.ifCanBeUnpacked(({ onConnection }) => {
              onConnection.independent.forEach(handler => handler({ ws, message: req }))

              onConnection.ordered.slice(1).reduce(
                (acc, fn) => fn(acc),
                onConnection.ordered[0].handler({ ws, message: req }) // Call the first function to get the initial value
              );
            })

            ws.on("message", async (message) => {

              // TODO: introdice a hook which intercepts the message before it si being parsed 

              this.transformMsg(message.toString()).try({

                ifNone: () => {
                  this.sendUnprocessableMessageType(ws, {
                    channel: "unknown",
                    handler: "onMessageReceived",
                    msg: {
                      // error: `messages to this websockt server must follow the following shape {channel: string, message: string, payload: string}`
                    },
                  });
                },

                ifNotNone: async (parsedMessage) => {

                  try {
                    this.hooks.ifCanBeUnpacked(({ beforeHandle, afterHandle, onError }) => {
                      beforeHandle.map(hook => {
                        hook.independent.forEach(handler => handler({
                            ws,
                            message: parsedMessage
                          }))
                        hook.ordered.reduce(
                          (acc, fn) => fn.handler(acc),
                          hook.ordered[0].handler({ ws, message: req }) // Call the first function to get the initial value
                        )
                      })

                    })
                    new Optionable(
                      BetterArray.new(entries(this.channels)).filter(
                        ([channelName, channelConfig]) =>
                          channelName === parsedMessage.channel // iif you are searching the cause of a bug uit probably is not this so dont bother trying to uderstand why the compiler isnt happy here
                      ).normalArray[0]
                    ).try({
                      ifNone: () =>
                        console.log(
                          `thiere is no open channel called ${parsedMessage.channel}`,
                          JSON.stringify(parsedMessage)
                        ),

                      ifNotNone: ([channelName, channelConfig]) => {
                        new Optionable(
                          channelConfig.messagesItCanReceive[parsedMessage.message /* as keyof Channels[keyof Channels]["messagesItCanReceive"] */]

                        ).try({
                          ifNone: () =>
                            console.log(
                              `channel ${JSON.stringify(
                                channelName
                              )} does not accept message type ${parsedMessage.message
                              }`
                            ),

                          ifNotNone: ({ config, parse, }) => {
                            // console.log("f", messageConfig);
                            // console.log("[][]", parsedMessage.payload);
                            config.map(
                              ({ handler, hooks: { beforeHandler, afterHandler } }) => {

                                beforeHandler.map(hook => {
                                  hook.independent.forEach(h => h({ ws, message: parsedMessage }));
                                  [hook.ordered.reduce(
                                    (acc, fn) => fn.handler(acc),
                                    hook.ordered[0].handler({ ws, message: req }) // Call the first function to get the initial value
                                  )]
                                    .map(pipeResult => [handler(pipeResult)]
                                      .map(resultOfHandler => {
                                        afterHandler.map(hook => {
                                          hook.independent.forEach(h => ({ ws, message: resultOfHandler }))
                                          hook.ordered.reduce(
                                            (acc, fn) => fn.handler(acc),
                                            hook.ordered[0].handler({ ws, message: resultOfHandler }) // Call the first function to get the initial value
                                          )
                                        })
                                      })
                                    )
                                })


                              })
                          },
                        });
                      },
                    });

                    this.hooks.ifCanBeUnpacked(hooks => {
                      hooks.afterHandle.map(hook => {

                        hook.independent.forEach(handler => handler(/* pasaas the result of the handler of the executed message */))
                        hook.ordered.reduce
                      })
                    })
                  } catch (err) {

                    this.hooks.ifCanBeUnpacked(({ onError }) => onError(err))

                    // here call the onError handler if the message handler 
                    onError.try({
                      ifNotNone: () => { }
                    })


                  }
                },




              });






            });

            ws.on("close", (code, reason) => {


              this.hooks.ifCanBeUnpacked(hooks => {
                hooks.onClose.independent.forEach(h => h({ ws, message: { code, reason: reason.toString() } }))
              })

              // console.log(`WebSocket closed with code ${code}: ${reason}`);
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

  addChannel<NewName extends string>(config: {
    name: NewName;
    handlers: {
      [x: string]: {};
    };
    hooks: ServerHooks;
  }): NewName extends ChannelNames ? never : CustomWebSocketRouter<> {
    Object.entries(this.channels).forEach(([channelName, value]) => {
      if (channelName === config.name) {
        panic(`Channel ${channelName} is already defined`)
      }
    })

    return new CustomWebSocketRouter<ChannelNames | NewName, Channels & typeof config.handlers, Context, ContextKeys>({
      ...
    })
  }


  hook<NewHookName extends string, HookReturnType>(config: {
    name: NewHookName,
    type: string,
    handler: Handler<LastHookReturnType,HookReturnType> 
  }){} // adds a new hook 
}
