import { Port, WebsocketUrl } from "@custom-express/better-standard-library";
import { defintion } from "../definition";

export const builder = defintion.getCLientBuilder(
  WebsocketUrl.unsafe.withLocalhost(new Port(4444))
);
