import type { Port } from "@blazyts/better-standard-library";

import * as http from "node:http";

import type { CustomWebSocketRouter } from "./websocket/server/app";

export class AppBuilder {
    httpServer: {}; //

    start(port: Port, wsServer: CustomWebSocketRouter<>) {
        const server = http.createServer(this.httpServer);
        server.on("upgrade", (req, socket, head) => {
            if (req.url === "/ws") {
                wsServer.handleUpgrade(req, socket, head, (ws) => {
                    wsServer.emit("connection", ws, req);
                });
            }
            else {
                socket.destroy(); // invalid upgrade
            }
        });
        server.listen(port, () => {
            console.log(`Express + WebSocket server listening on port ${port}`);
        });
    }
}
