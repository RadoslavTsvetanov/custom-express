import { Optionable } from "errors-as-types/lib/rust-like-pattern/option";
import type { WebsocketUrl } from "../../types/networking/urls/websocket";
import type { ChannelConfig } from "./types";
import type { z } from "zod";
import { panic } from "../../utils/panic";

// note unlike the WebsocketClient this does not reuse connection but establishes new ones each time start is called
class WebsocketListener {
  private handlers;
  private url: string;
  private endpoints
  constructor(messageHandlers, url: WebsocketUrl, endpoints) {
    this.handlers = messageHandlers;
    this.url = url.value;
    this.endpoints = endpoints
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
            this.endpoints[channel].messagesItCanReceive[message].unsafe === false)
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


  export class WebsocketClient
    <
      ChannelNames extends string,
      E extends Record<ChannelNames, ChannelConfig<any, any>>,
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
      this.ws = new WebSocket(this.url.value);

      this.ws.onopen = () => {
        // this.ws.send("data")
        console.log("WebSocket connected:", this.url)
      };
      this.ws.onerror = (err) => console.error("WebSocket error:", err);
    }

    setupListeners( // it is true | false instead of boolean since if it is true or false we can pass them as type values while if it is as a bool it will be apssed as a value not type so we cant check which one was passed, Made it as a simple builder
      messageReceivers: {
        [Channel in keyof E]: {
            [Message in keyof E[Channel]["messagesItCanSend"]]: {
            handler: (
              d: z.infer<E[Channel]["messagesItCanSend"][Message]>
            ) => Promise<void>;
            unsafe?: boolean;
          }
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

          if (!(channel in messageReceivers) || !(message in messageReceivers[channel])) {
            console.warn("Unhandled message:", data);
            return;
          }

          const receiver = messageReceivers[channel][message];

          try {
            this.endpoints[channel].messagesItCanSend[message].parse(payload);
            await receiver.handler(payload);
          } catch (e) {
            if (receiver.unsafe) {
              console.log("Unsafe mode enabled: Processing invalid message:", JSON.stringify(payload));
              await receiver.handler(payload);
            } else {
              console.error("Message validation failed:", e);
            }
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };
    }




    getReusableListener(

      messageReceivers: {
        [Channel in keyof E]: {
            [Message in keyof E[Channel]["messagesItCanSend"]]: {
            handler: (
              d: z.infer<E[Channel]["messagesItCanSend"][Message]>
            ) => Promise<void>;
            unsafe?: boolean;
          }
        };
      }

    ) {
      return new WebsocketListener(messageReceivers, this.url, this.endpoints)
    }


    generateClient():
  {
      [Channel in keyof E]: {
        [Message in keyof E[Channel]["messagesItCanReceive"]]: (
          d: z.infer<E[Channel]["messagesItCanReceive"][Message]>
        ) => void;
      };
    }

      {
        
      const client: any = {};
      console.log("h")
      Object.entries(this.endpoints).forEach(([channelName, channelConfig]) => {
        client[channelName] = {};

        Object.entries(channelConfig.messagesItCanReceive).forEach(
          ([messageName, schema]) => {
            client[channelName][messageName] = async (
              data: z.infer<typeof schema>
            ) => {
              try {
              const newws = new WebSocket(this.url) // horrible performance if possible make it all thingd from this class to reuse one connection so that one clientInsyance is one connection
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
              }
                console.log("after")
              } catch (error) {
                console.error(`Invalid message format for ${messageName}:`, error);
              }
            };
          }
        );
      });

      return client;
    }
  }

