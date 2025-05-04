import { Server } from "socket.io";
import { getAccountFromToken } from "./auth.js";

class WebSocket {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: [process.env.PUBLIC_FRONTEND_URL, process.env.PRIVATE_FRONTEND_URL],
                credentials: true
            }
        });

        this.io.use(async (socket, next) => {
            const cookieHeader = socket.handshake.headers.cookie;

            if (!cookieHeader) return next();

            let token = undefined;
            try {
                cookieHeader.split("; ").forEach(cookie => {
                    const cookieParts = cookie.split("=");
                    if (cookieParts[0] === "token") {
                        token = cookieParts[1]
                    }
                });
            } catch {
                return next();
            }

            if (!token) return next();

            const userId = await getAccountFromToken(token);
            if (userId) {
                socket.join("admin");
            }
            next();
        });
    }

    sendGroupsUpdate(groupName) {
        this.io.emit("main:groupUpdated", { message: `Groupe ${groupName} mis à jour` });
    }

    sendStatsUpdate() {
        this.io.to("admin").emit("dashboard:home:updated", { message: "" });
    }
}

export default WebSocket;