"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.host = exports.defaultHost = void 0;
exports.defaultHost = {
    processId: process.pid,
    processName: process.title,
    frameworkVersion: process.version,
    operatingSystemVersion: process.platform,
    assembly: (_a = require.main) === null || _a === void 0 ? void 0 : _a.filename,
};
function host() {
    return exports.defaultHost;
}
exports.host = host;
