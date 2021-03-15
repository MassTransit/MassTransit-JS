"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendContext = void 0;
var guid_typescript_1 = require("guid-typescript");
var host_1 = require("./host");
var messageType_1 = require("./messageType");
var SendContext = /** @class */ (function () {
    function SendContext(message) {
        this.message = message;
        this.messageId = guid_typescript_1.Guid.create().toString();
        this.host = host_1.host();
    }
    SendContext.prototype.setMessageType = function (name, ns) {
        this.messageType = new messageType_1.MessageType(name, ns).toMessageType();
    };
    return SendContext;
}());
exports.SendContext = SendContext;
