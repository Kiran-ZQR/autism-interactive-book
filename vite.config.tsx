"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// client/vite.config.ts
var vite_1 = require("vite");
var plugin_react_1 = require("@vitejs/plugin-react");
var path_1 = require("path");
exports.default = (0, vite_1.defineConfig)({
    base: '/autism-interactive-book/', // 👈 一定要加，前后都要 /
    plugins: [(0, plugin_react_1.default)()],
    resolve: {
        alias: {
            '@': (0, path_1.resolve)(__dirname, 'src'), // 保持你的 alias
        },
    },
});
