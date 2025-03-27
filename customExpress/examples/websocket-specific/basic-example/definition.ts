import { z } from "zod";
import { customWebsocket, CustomWebSocketRouter } from "../../../src/builtins/WebSocketServer";
import { Port } from "../../../src/types/networking/port";

export const wsRouter = new CustomWebSocketRouter(
  {
    helloRoute: {
      messagesItCanReceive: {
        newData: z.object({
          message: z.string().min(20),
        }),
        newNotification: z.object({
          authToken: z.string(),
          data: z.object({
            metadata: z.string(),
            message: z.string(),
          }),
        }),
      },
      messagesItCanSend: {
        sendHelloTheOtherListeners: z.object({
          message: z.string().nonempty(),
        }),
        sayByeToRestOfTheListeners: z.object({
          byeConfig: z.object({
            people: z.array(z.string()),
          }),
        }),
      },
    },
    userRoute: {
      messagesItCanReceive: {
        checkForInvalidUsersInRoom: z.object({
          roomId: z.number(),
          authKey: z.string(),
          userId: z.number(),
        }),
        deleteUser: z.object({
          userId: z.string(),
          authKey: z.string(),
        }),
      },
      messagesItCanSend: {
        invalidUserDetected: z.object({
          userId: z.string(),
        }),
        deletedUser: z.object({
          userId: z.string(),
        }),
      },
    },
  },
  {
    helloRoute: {
      newData: (v) => {
        v.message;
      },
      newNotification: (v) => {
        v.data.message;
      },
    },
    userRoute: {
      checkForInvalidUsersInRoom: (v) => {},
      deleteUser: (v) => {},
    },
  }
);
