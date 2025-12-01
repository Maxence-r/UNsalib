module.exports = {
    apps: [
        {
            name: "unsalib-frontend-louisa",
            script: "serve",
            env: {
                PM2_SERVE_PATH: "./frontend/dist/",
                PM2_SERVE_PORT: 3000,
                PM2_SERVE_SPA: "true",
            },
        },
        {
            name: "unsalib-backend-louisa",
            script: "./backend/dist/server.js",
        },
    ],
};
