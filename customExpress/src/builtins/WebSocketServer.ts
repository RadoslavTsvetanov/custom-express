import { WebSocketServer, WebSocket } from "ws";
import { z, ZodSchema, infer as ZodInfer } from "zod";
import type { Port } from "../types/networking/port.ts";
import type { ApiPath } from "../types/apiApth.ts";

// Extracts TypeScript types from Zod schemas
type InferMessages<T extends Record<string, ZodSchema>> = {
  [K in keyof T]: { type: K; data: ZodInfer<T[K]> };
};


type ObjectWithReplacedKey<
  OldObject,
  KeyToReplace extends keyof OldObject,
  NewType
> = {
  [K in keyof OldObject]: K extends KeyToReplace ? NewType : OldObject[K];
};




type H = {
  h: string
}

type y = ObjectWithReplacedKey<"h",number, H>



export namespace customWebsocket {
  export type CustomWebsocketObject ={} 
  export class CustomWebSocketRouter {
    private port: Port;
    private wss: WebSocketServer;
    private subRoutes: Record<string, CustomWebSocketRouter> = {};

    constructor(port: Port) {
      this.port = port;
      this.wss = new WebSocketServer({ port: port.value });
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

    private transformMsg<T extends object>(v: string): T | null {
      try {
        return JSON.parse(v) as T;
      } catch {
        return null;
      }
    }

    addRoute<
      TSendSchemaKeys extends object,
      TRecieveSchemaKeys extends object,
      TSendSchema extends Record<keyof TSendSchema, ZodSchema>,
      TReceiveSchema extends Record<keyof TRecieveSchemaKeys, ZodSchema>
    >(
      path: ApiPath,
      handlers: {
        onMsgReceived: {
          [K in keyof InferMessages<TReceiveSchema>]: (
            ws: WebSocket,
            msg: InferMessages<TReceiveSchema>[K]
          ) => void;
        };
        onConnection: (ws: WebSocket) => void;
        onExit: (ws: WebSocket, code: number, reason: string) => void;
      },
      validator: {
        messagesItCanSend: TSendSchema;
        messagesItCanReceive: TReceiveSchema;
      }
    ) {
      this.wss.on("connection", (ws) => {
        handlers.onConnection(ws);

        ws.on("message", async (message) => {
          const parsedMessage = this.transformMsg<{
            type: string;
            data: unknown;
          }>(message.toString());

          if (!parsedMessage || !parsedMessage.type) {
            this.sendUnprocessableMessageType(ws, {
              channel: path.value,
              handler: "onMessageReceived",
              msg: parsedMessage || {},
            });
            return;
          }

          const schema = validator.messagesItCanReceive[parsedMessage.type];
          if (!schema) {
            this.sendUnprocessableMessageType(ws, {
              channel: path.value,
              handler: "onMessageReceived",
              msg: parsedMessage,
            });
            return;
          }

          const validationResult = schema.safeParse(parsedMessage.data);
          if (!validationResult.success) {
            ws.send(
              JSON.stringify({
                error: "Invalid message format",
                details: validationResult.error.format(),
              })
            );
            return;
          }

          const handler = handlers.onMsgReceived[
            parsedMessage.type as keyof InferMessages<TReceiveSchema>
          ];
          if (handler) {
            try {
              await handler(ws, {
                type: parsedMessage.type,
                data: validationResult.data,
              });
            } catch (error) {
              ws.send(
                JSON.stringify({
                  error: "Handler execution failed",
                  details: (error as Error).message,
                })
              );
            }
          }
        });

        ws.on("close", (code, reason) => {
          handlers.onExit(ws, code, reason.toString());
        });
      });
    }

    getServer() {
      return this.wss;
    }
  }
}

