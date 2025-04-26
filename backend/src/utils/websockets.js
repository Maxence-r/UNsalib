import { Server } from 'socket.io';
import { getAccountFromToken } from './auth.js';

class WebSocket {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: [process.env.PUBLIC_FRONTEND_URL, process.env.PRIVATE_FRONTEND_URL]
            }
        });

        this.io.engine.use(async (req, res, next) => {
            const token = req.headers['authorization'];

            if (req._query.sid != undefined || !token) {
                return next();
            }

            try {
                const userId = await getAccountFromToken(token);
                if (userId) {
                    req.userId = userId;
                    return next();
                }
                throw new Error();
            } catch {
                next();
            }
        });

        this.io.sockets.on('connection', (socket) => {
            if (socket.request.userId) {
                socket.join('admin');
                console.log("ok");
                socket.to('admin').emit('joinAdminSuccessful');
            }
        });
    }

    sendGroupsUpdate(groupName) {
        this.io.emit('groupUpdated', { message: `Groupe ${groupName} mis à jour` });
    }

    sendStatsUpdate() {
        this.io.emit('statsUpdated', { message: '' });
    }
}

export default WebSocket;