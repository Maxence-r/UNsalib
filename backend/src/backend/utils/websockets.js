import { Server } from 'socket.io';

class WebSocket {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: [process.env.PUBLIC_FRONTEND_URL, process.env.PRIVATE_FRONTEND_URL]
            }
        });
    }

    sendGroupsUpdate(groupName) {
        this.io.emit('groupUpdated', { message: `Groupe ${groupName} mis à jour` });
    }

    sendStatsUpdate() {
        this.io.emit('statsUpdated', { message: '' });
    }

    listenAdminConnections() {
        this.io.sockets.on('connection', (socket) => {
            socket.on('joinAdmin', (token) => {
                socket.join('admin');
                console.log("ok")
                socket.to('admin').emit('joinAdminSuccessful');
            });
        });
    }
}

export default WebSocket;