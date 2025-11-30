"use client";

import { io } from "socket.io-client";

export const socket = io(import.meta.env.NEXT_PUBLIC_SOKETIO_URL, {
    withCredentials: true
});