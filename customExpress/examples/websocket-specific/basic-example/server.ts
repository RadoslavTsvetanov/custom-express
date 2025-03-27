import { Port } from "../../../src/types/networking/port";
import { wsRouter } from "./definition";


wsRouter.start(new Port(4000) )

export { wsRouter }
