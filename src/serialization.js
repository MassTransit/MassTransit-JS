"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonMessageSerializer = exports.MessageTypeDeserializer = void 0;
var consumeContext_1 = require("./consumeContext");
var events_1 = __importDefault(require("events"));
var class_transformer_1 = require("class-transformer");
var MessageTypeDeserializer = /** @class */ (function () {
    function MessageTypeDeserializer(receiveEndpoint) {
        this._emitter = new events_1.default();
        this.receiveEndpoint = receiveEndpoint;
    }
    MessageTypeDeserializer.prototype.on = function (handler) {
        this._emitter.on("message", handler);
    };
    MessageTypeDeserializer.prototype.off = function (handler) {
        this._emitter.off("message", handler);
    };
    MessageTypeDeserializer.prototype.dispatch = function (json) {
        var context = class_transformer_1.deserialize(consumeContext_1.ConsumeContext, json);
        context.receiveEndpoint = this.receiveEndpoint;
        this._emitter.emit("message", context);
    };
    return MessageTypeDeserializer;
}());
exports.MessageTypeDeserializer = MessageTypeDeserializer;
var JsonMessageSerializer = /** @class */ (function () {
    function JsonMessageSerializer() {
    }
    JsonMessageSerializer.prototype.serialize = function (send) {
        return Buffer.from(class_transformer_1.serialize(send));
    };
    return JsonMessageSerializer;
}());
exports.JsonMessageSerializer = JsonMessageSerializer;
