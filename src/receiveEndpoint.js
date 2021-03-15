"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultReceiveEndpointOptions = exports.ReceiveEndpoint = void 0;
var class_transformer_1 = require("class-transformer");
var messageContext_1 = require("./messageContext");
var serialization_1 = require("./serialization");
var transport_1 = require("./transport");
var ReceiveEndpoint = /** @class */ (function (_super) {
    __extends(ReceiveEndpoint, _super);
    function ReceiveEndpoint(bus, queueName, options) {
        if (options === void 0) { options = exports.defaultReceiveEndpointOptions; }
        var _this_1 = _super.call(this, bus) || this;
        _this_1.queueName = queueName;
        _this_1.options = options;
        _this_1.address = bus.brokerUrl.endsWith("/") ? bus.brokerUrl + queueName : bus.brokerUrl + "/" + queueName;
        _this_1._messageTypes = {};
        _this_1.on("channel", function (context) { return _this_1.onChannel(context); });
        return _this_1;
    }
    ReceiveEndpoint.prototype.handle = function (messageType, listener) {
        if (this._messageTypes.hasOwnProperty(messageType)) {
            this._messageTypes[messageType].on(listener);
        }
        else {
            var deserializer = new serialization_1.MessageTypeDeserializer(this);
            this._messageTypes[messageType] = deserializer;
            deserializer.on(listener);
        }
        return this;
    };
    ReceiveEndpoint.prototype.emitMessage = function (msg) {
        this.emit("message", msg);
    };
    ReceiveEndpoint.prototype.onChannel = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var _this, channel, consume;
            var _this_1 = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _this = this;
                        channel = context.channel;
                        return [4 /*yield*/, this.configureTopology(channel)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, channel.consume(this.queueName, function (msg) {
                                if (msg === null)
                                    return;
                                try {
                                    _this.emit("message", msg);
                                    var text = msg.content.toString();
                                    var context_1 = class_transformer_1.deserialize(messageContext_1.MessageContext, text);
                                    if (context_1 && context_1.messageType && context_1.messageType.length > 0) {
                                        var messageType = context_1.messageType[0];
                                        var deserializer = _this_1._messageTypes[messageType];
                                        if (deserializer instanceof serialization_1.MessageTypeDeserializer) {
                                            deserializer.dispatch(text);
                                        }
                                    }
                                    channel.ack(msg);
                                }
                                catch (e) {
                                    channel.reject(msg, true);
                                }
                            }, this.options)];
                    case 2:
                        consume = _a.sent();
                        this.options.consumerTag = consume.consumerTag;
                        console.log("Receive endpoint started:", this.queueName, "ConsumerTag:", consume.consumerTag);
                        return [2 /*return*/];
                }
            });
        });
    };
    ReceiveEndpoint.prototype.configureTopology = function (channel) {
        return __awaiter(this, void 0, void 0, function () {
            var queue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, channel.prefetch(this.options.prefetchCount, this.options.globalPrefetch)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, channel.assertExchange(this.queueName, "fanout", this.options)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, channel.assertQueue(this.queueName, this.options)];
                    case 3:
                        queue = _a.sent();
                        return [4 /*yield*/, channel.bindQueue(this.queueName, this.queueName, "")];
                    case 4:
                        _a.sent();
                        console.log("Queue:", queue.queue, "MessageCount:", queue.messageCount, "ConsumerCount:", queue.consumerCount);
                        return [2 /*return*/];
                }
            });
        });
    };
    return ReceiveEndpoint;
}(transport_1.Transport));
exports.ReceiveEndpoint = ReceiveEndpoint;
exports.defaultReceiveEndpointOptions = {
    prefetchCount: 1,
    globalPrefetch: true,
    durable: true,
    autoDelete: false,
    noAck: false,
};
