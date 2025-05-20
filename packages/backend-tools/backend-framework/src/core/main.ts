import { Port } from "@custom-express/better-standard-library";
import { CustomWebSocketRouter } from "./websocket/server/app";
import * as http from "http"
export class AppBuilder {
        httpServer: {} //

    start(port: Port, wsServer: CustomWebSocketRouter<>) {
        const server = http.createServer(this.httpServer);
        server.on('upgrade', (req, socket, head) => {
            if (req.url === '/ws') {
                wsServer.handleUpgrade(req, socket, head, (ws) => {
                    wsServer.emit('connection', ws, req);
                });
            } else {
                socket.destroy(); // invalid upgrade
            }
        })
        server.listen(port, () => {
            console.log(`Express + WebSocket server listening on port ${port}`);
        });

    }
}