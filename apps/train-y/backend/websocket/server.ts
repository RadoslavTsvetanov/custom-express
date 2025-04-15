// Fix the implementation of your websocket server
import { Port } from "../../../../src/types/networking/port";
import { env } from "../envs";
import type { IAuth } from "../services/auth/interface";
import type { ITrain } from "../services/train/interface";
import type { IUser } from "../services/user/interface";
import { defintion } from "./definition";

// Make sure 'definition' is correctly created with the proper endpoints
// that match the handlers you're implementing

defintion
  .store<{
    services: {
      user: IUser;
      auth: IAuth;
      train: ITrain;
    };
  }>({
    services: {
      user: {} as IUser, // Provide actual implementations or mock objects
      auth: {} as IAuth,
      train: {} as ITrain,
    },
  }).
    onConnection: v => {
      console.log("New connection established");
    },
    afterMessage: v => {
      console.log("Message processed:", v.msg.payload);
    },
    beforeMessage: v => {
      console.log(`
        Log
        ${JSON.stringify(v.message)}
      `);
    },
    train: {
      newTrainData: ({ data, store }) => {
        console.log("Processing train data:", data.id);
        store.services.train.addData(data.id, {
          timestamp: data.timestamp,
          location: data.location,
          data: {
            ...data,
          },
        });
      },
    },
    passanger: {
      newPassangerData: ({ store, data }) => {
        console.log("Processing passenger data:", data.id);
        store.services.user.addData(data.id, {
          ...data,
          data: {
            ...data,
          },
        });
      },
    },
  })
  .start(new Port(env.runningPort));
