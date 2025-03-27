import { Port } from "../../../src/types/networking/port";
import { wsRouter } from "./definition";

wsRouter
    .implement(
  {
    helloRoute: {
      newData: v => {
        console.log("g",v.message);
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
)

wsRouter.start(new Port(4000) )