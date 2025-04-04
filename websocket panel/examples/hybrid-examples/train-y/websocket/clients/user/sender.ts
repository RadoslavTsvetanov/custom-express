import { Port } from "../../../../../../src/types/networking/port";
import { WebsocketUrl } from "../../../../../../src/types/networking/urls/websocket";
import { defintion } from "../../definition";
import { builder } from "../client-builder";

const userSender = builder.generateClient();

setInterval(() => {
  userSender.passanger.newPassangerData({
    location: {
      latitude: 50,
      longitude: 50,
    },
    id: (1).toString(),
    timestamp: new Date(),
  });
}, 3000);
