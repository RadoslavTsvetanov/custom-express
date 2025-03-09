import { ZodObjectUnion } from './../types/zod/zod';
import uws, {WebSocket} from "uWebSockets.js"
import type {Port} from "../types/networking/port.ts";
import {ContextSafeType} from "../types/baseContextSafeTypet.ts";
import type { MyZodDefinitions } from "../types/zod/zod.ts";
import { z } from "zod";
import type { WithDescription } from '../types/generaltypes.ts';
import type { MyOpenApiDefinitions } from '../types/openapi/main.ts';



namespace customWebsocket {


    export namespace openWebsockets {

        export type Definition = {
            channels: openWebsockets.Channel[]
        }


        export type Channel = {
            [key: "subscribe" | "publish"]: {
                messages: {
                    contentType: MyOpenApiDefinitions.MIMEType
                    payload: MyOpenApiDefinitions.Entity
                }
            } & WithDescription
        } & WithDescription
    }


    export namespace CustomUwsTypeDefs {
      export type HandlerResponse<T extends ZodObjectUnion> = {
        data: T;
      };
        
        
        
        
        
        
      export type routeConfig = {
        open: <Response extends ZodObjectUnion>(
          ws: WebSocket<any>
        ) => HandlerResponse<Response>;
        close: <MessageTypeOnClose, Response extends ZodObjectUnion>(
          ws: WebSocket<MessageTypeOnClose>,
          code: number,
          message: ArrayBuffer
        ) => Response;
        message: <MessageTypeOnMsg, Response extends ZodObjectUnion>(
          ws: WebSocket<MessageTypeOnMsg>,
          message: ArrayBuffer
        ) => Response;
      };

      export class ApiPath<
        T /*to not repeat the type but instead assign to a "variable" that i can reuse*/ = string
      > extends ContextSafeType<T> {
        customValidator(v: T): boolean {
          return false;
        }
      }

      class CustomWebSocketRouter<T extends string> {
        private port: Port;
        private uws = uws.App();
        private  RouteDefinitions = 
        private subRoutes: Record<string, CustomWebSocketRouter<"">>;
        constructor(port: Port) {
          this.port = port;
        }

        private transformMsg<T>(v: ArrayBuffer): T {
          const decoder = new TextDecoder("utf-8");
          const jsonString = decoder.decode(v);

          return JSON.parse(jsonString);
        }

        getPath(k: keyof T) {}

        addRoute<
          Y extends MyZodDefinitions.ObjectUnion, // dont touch this and the one below since they are here just beacause MessageTypeOnClose    MessageTypeOnMsg need a generic too and these will be autoinfered, also ask if instead of these two genrics i could just use an unknown
          R extends MyZodDefinitions.ObjectUnion,
          MessageTypeOnClose extends MyZodDefinitions.ZodObjectUnion<R>,
          MessageTypeOnMsg extends MyZodDefinitions.ZodObjectUnion<Y>
        >(
          path: ApiPath,
          customWebsocketHandlersConfig: CustomUwsTypeDefs.routeConfig,
          validator: {
            messageTypeOnRecievedMessage: MessageTypeOnMsg;
            messageTypeOnExit: MessageTypeOnClose;
          }
        ) {
          this.uws.ws(path.value, {
            open: (ws: WebSocket<any>) => {
              customWebsocketHandlersConfig.open(ws);
            },
            close: (ws: WebSocket<any>, code: number, message: ArrayBuffer) => {
              const validationResult = validator.messageTypeOnExit.safeParse(
                this.transformMsg<MessageTypeOnMsg>(message)
              );

              if (validationResult.success) {
                customWebsocketHandlersConfig.close(ws, code, message);
              } else {
              }
            },
            message: (ws: WebSocket<any>, message: ArrayBuffer) => {
              const res = customWebsocketHandlersConfig.message(ws, message);
              ws.send(res); // TODO do the other 2 handlers like that too
            },
          });
        }

        getRouter() {
          return this.uws;
        }
          
          
          getDefinition() {
            //   return {
            //     channels: this.subRoutes.map((subRouter) => subRouter.getDefinition()),
            //   };
          }
      }
    }




}