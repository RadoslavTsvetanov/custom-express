import { Port } from "../../../../../src/types/networking/port";
import { WebsocketUrl } from "../../../../../src/types/networking/urls/websocket";
import { defintion } from "../definition";

export const builder = defintion.getCLientBuilder(
  WebsocketUrl.unsafe.withLocalhost(new Port(4444))
);
