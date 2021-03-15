"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageType = void 0;
var MessageType = /** @class */ (function () {
    function MessageType(name, ns) {
        this.name = name;
        this.ns = ns;
    }
    MessageType.prototype.toMessageType = function () {
        return ["urn:message:" + this.ns + ":" + this.name];
    };
    return MessageType;
}());
exports.MessageType = MessageType;
