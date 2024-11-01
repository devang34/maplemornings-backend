// pm2.config.js
module.exports = {
  apps: [
    {
      name: "mapple",
      script: "dist/app.js", // Change this to `dist/app.js`
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
