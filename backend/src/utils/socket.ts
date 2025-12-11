import { Server } from "socket.io";

import { accountsService } from "../services/accounts.service.js";

class Socket {
    private io: Server;

    public constructor(io: Server) {
        this.io = io;
        this.io.use((socket, next) => {
            const cookieHeader = socket.handshake.headers.cookie;

            if (!cookieHeader) return next();

            let token = undefined;
            try {
                cookieHeader.split("; ").forEach((cookie) => {
                    const cookieParts = cookie.split("=");
                    if (cookieParts[0] === "token") {
                        token = cookieParts[1];
                    }
                });
            } catch {
                return next();
            }

            if (!token) return next();

            accountsService.getFromToken(token)
                .then((userId) => {
                    if (userId) {
                        void socket.join("admin");
                    }
                    next();
                })
                .catch(() => {
                    next();
                });
        });
    }

    sendGroupsUpdate(groupName: string): void {
        this.io.emit("main:groupUpdated", {
            message: `Groupe ${groupName} mis à jour`,
        });
    }

    sendRoomsUpdate(rooms: { id: string; available: boolean }[]): void {
        this.io.emit("app:main:available", {
            ts: Date.now(),
            rooms: rooms
        });
    }

    sendStatsUpdate(): void {
        this.io.to("admin").emit("dashboard:home:updated", { message: "" });
    }
}

export { Socket };
