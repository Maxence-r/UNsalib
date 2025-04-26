"use client";

import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_SOKETIO_URL);

export const adminSocket = io(process.env.NEXT_PUBLIC_SOKETIO_URL, {
    extraHeaders: {
        authorization: document.cookie.split("; ").filter(cookie => cookie.includes("token"))[0].split("=")[1] || ""
    }
});