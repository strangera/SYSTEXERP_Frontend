const PROXY_CONFIG = {
    "/ipify": {
        "target": "http://api.ipify.org",
        "secure": false,
        "changeOrigin": true,
        "logLevel": "debug",
        "pathRewrite": {
            "^/ipify": ""
        }
    },
    "/api": {
        "target": "http://localhost:7205", // 替换为你的 C# Web API 的地址
        "secure": false,
        "changeOrigin": true,
        "logLevel": "debug",
        "pathRewrite": {
            "^/api": ""
        }
    }
};

module.exports = PROXY_CONFIG;
