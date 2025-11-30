import "dotenv/config";
import { connect } from "mongoose";
import { Server } from "socket.io";

import { app } from "./app.js";
import { logger } from "utils/logger.js";
import { config } from "configs/app.config.js";
import { Socket } from "utils/socket.js";

async function connectToDb(): Promise<void> {
    try {
        const conn = await connect(config.mongodb.uri);
        logger.info("MongoDB connection successful");
        logger.info(`Host: ${conn.connection.host}`);
        logger.info(`Database: ${conn.connection.name}`);

        // Handle connection events
        conn.connection.on("error", (err) => {
            logger.error("MongoDB connection error:", err);
        });

        conn.connection.on("disconnected", () => {
            logger.warn("MongoDB disconnected");
        });

        conn.connection.on("reconnected", () => {
            logger.info("MongoDB reconnected");
        });
    } catch (error) {
        logger.error("Error connecting to MongoDB:", error as string);
        process.exit(1);
    }
}

// Start server function
async function startServer(): Promise<Socket> {
    try {
        // Connect to database
        void (await connectToDb());

        // Start server
        const server = app.listen(config.server.port, () => {
            logger.info(`Server running on port ${config.server.port}`);
        });

        // Handle unhandled promise rejections
        process.on("unhandledRejection", (err) => {
            logger.error("Unhandled Rejection:", err);
            server.close(() => {
                process.exit(1);
            });
        });

        // Handle SIGTERM
        process.on("SIGTERM", () => {
            logger.info("SIGTERM received. Closing server gracefully...");
            server.close(() => {
                logger.info("Process terminated");
            });
        });

        // Initialize a new Socket.IO server
        const socketServer = new Server(server, {
            cors: {
                origin: config.cors.origin,
                credentials: true,
            },
        });

        // Returns the resulting socket
        return new Socket(socketServer);
    } catch (error) {
        logger.error("Failed to start server:", error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    process.exit(1);
});

// Start the server and store the built socket
const socket = startServer();

export { socket };
