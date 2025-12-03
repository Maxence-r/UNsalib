import { useEffect } from "react";

import { socket } from "../socket.js";

function useSocket() {
    useEffect(() => {
        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            console.log("Connected to Socket.IO server");
        }

        function onDisconnect() {
            console.log("Disconnected from Socket.IO server");
        }

        // function onGroupUpdated(value: { message: string }) {
        //     setUpdatedGroupsList((previous) => {
        //         if (previous.length < 3) {
        //             return [...previous, value.message];
        //         } else {
        //             const newArray = previous.slice(
        //                 previous.length - 3,
        //                 previous.length,
        //             );
        //             newArray.push(value.message);
        //             return newArray;
        //         }
        //     });
        // }

        function onError(error: string) {
            console.error("Socket.IO error:", error);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        // socket.on("main:groupUpdated", onGroupUpdated);
        socket.on("app:main:available", (data) => console.log(data.rooms));
        socket.on("error", onError);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            // socket.off("main:groupUpdated", onGroupUpdated);
            socket.off("error", onError);
        };
    }, []);
}

export { useSocket };
