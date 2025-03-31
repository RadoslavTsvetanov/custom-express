import { WebsocketUrl } from "../../../../../../src/types/networking/urls/websocket";
import { defintion } from "../../definition";
import { builder } from "../client-builder";

builder.setupListeners<false>({
  train: {
    trainData: {
      handler: async (v) => {
        console.log(v);
      },
    },
  },
});
