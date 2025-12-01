module.exports = {
    apps: [
        {
            name: "unsalib-frontend",
            script: "serve",
            env: {
                PM2_SERVE_PATH: "./frontend/dist/",
                PM2_SERVE_PORT: 3000,
                PM2_SERVE_SPA: "true",
                PM2_SERVE_HOMEPAGE: "./frontend/dist/index.html",
            },
        },
        {
            name: "unsalib-backend",
            script: "./backend/dist/server.js",
        },
    ],
};
