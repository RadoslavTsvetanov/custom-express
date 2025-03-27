import { Optionable } from "errors-as-types/lib/rust-like-pattern/option";
import type { WebsocketUrl } from "../../types/networking/urls/websocket";
import type { ChannelConfig } from "./types";
import type { z } from "zod";

  export class WebsocketClient
    <
      ChannelNames extends string,
      E extends Record<ChannelNames, ChannelConfig<any, any>>,
      Context extends Record<string, unknown>
    > {

    private url: string;
    public ws: WebSocket;
    private endpoints: E;
    private context: Context;

      constructor(url: WebsocketUrl, endpoints: E, context?: Context) {
      this.url = url.value;
      this.endpoints = endpoints;
      this.context = new Optionable(context).unpack_with_default({} as Context);
      this.initWebSocket();
    }

    private initWebSocket() {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.ws.send("data")
        console.log("WebSocket connected:", this.url)
      };
      this.ws.onclose = () => {
        console.warn("WebSocket closed. Attempting to reconnect...");
        setTimeout(() => this.initWebSocket(), 3000); // Simple reconnect strategy
      };
      this.ws.onerror = (err) => console.error("WebSocket error:", err);
    }

    setupListeners(
      messageReceivers: {
        [Channel in keyof E]: {
          [Message in keyof E[Channel]["messagesItCanSend"]]: {
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

      Object.entries(this.endpoints).forEach(([channelName, channelConfig]) => {
        client[channelName] = {};

        Object.entries(channelConfig.messagesItCanReceive).forEach(
          ([messageName, schema]) => {
            client[channelName][messageName] = async (
              data: z.infer<typeof schema>
            ) => {
              try {
                schema.parse(data);
                console.log(data)
                this.ws.send(
                  JSON.stringify({
                    channel: channelName,
                    message: messageName,
                    payload: data,
                    context: this.context, // Include context in messages
                  })
                );
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

