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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = __importDefault(require("events"));
var amqplib_1 = require("amqplib");
var receiveEndpoint_1 = require("./receiveEndpoint");
var util_1 = require("./util");
var guid_typescript_1 = require("guid-typescript");
var MassTransitBus = /** @class */ (function (_super) {
    __extends(MassTransitBus, _super);
    function MassTransitBus(brokerUrl) {
        var _this_1 = _super.call(this) || this;
        _this_1.brokerUrl = brokerUrl;
        _this_1.setMaxListeners(0);
        _this_1.stopped = false;
        _this_1._retryIntervalInSeconds = 3;
        _this_1.busEndpoint = _this_1.receiveEndpoint("bus-" + guid_typescript_1.Guid.create().toString(), function (config) {
            config.options.durable = false;
            config.options.autoDelete = true;
            config.options.arguments = { "x-expires": 60000 };
        });
        _this_1.connect()
            .catch(function () { return function (err) { return setImmediate(function () {
            throw new Error("Unexpected code block reached: " + err.message + "\n" + err.stack);
        }); }; });
        return _this_1;
    }
    MassTransitBus.prototype.stop = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connection, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.stopped)
                            return [2 /*return*/, Promise.resolve()];
                        this.stopped = true;
                        if (this._cancelConnect) {
                            this._cancelConnect();
                            this._cancelConnect = null;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.connection];
                    case 2:
                        connection = _a.sent();
                        if (!connection) return [3 /*break*/, 4];
                        return [4 /*yield*/, connection.close()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        console.log("Bus stopped", this.brokerUrl);
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        console.error("failed to close bus", e_1.message);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    MassTransitBus.prototype.restart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.stopped) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.stop()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.connect()
                            .catch(function () { return function (err) { return setImmediate(function () {
                            throw new Error("Unexpected code block reached: " + err.message + "\n" + err.stack);
                        }); }; });
                        this.stopped = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    MassTransitBus.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this, connection, e_2;
            var _this_1 = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _this = this;
                        console.log("Connecting", this.brokerUrl);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        this.connection = amqplib_1.connect(this.brokerUrl + "?heartbeat=60");
                        return [4 /*yield*/, this.connection];
                    case 2:
                        connection = _a.sent();
                        connection.on("error", function (err) {
                            if (err.message !== "Connection closing") {
                                console.error("Connection error", err.message);
                                _this.emit("error", err);
                            }
                        });
                        connection.on("close", function () {
                            _this_1.emit("disconnect", _this_1.brokerUrl);
                            _this_1.scheduleReconnect();
                        });
                        console.log("Connected", this.brokerUrl);
                        this.emit("connect", { brokerUrl: this.brokerUrl, connection: connection });
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        console.error("Connect failed", e_2.message);
                        this.scheduleReconnect();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MassTransitBus.prototype.scheduleReconnect = function () {
        var _this_1 = this;
        if (this.stopped)
            return;
        var handle = util_1.delay(this._retryIntervalInSeconds * 1000);
        this._cancelConnect = handle.cancel;
        handle.promise()
            .then(function () { return _this_1.connect(); })
            .catch(function () { return function (err) { return setImmediate(function () {
            throw new Error("Unexpected code block reached: " + err.message + "\n" + err.stack);
        }); }; });
    };
    MassTransitBus.prototype.sendEndpoint = function (args) {
        return this.busEndpoint.sendEndpoint(args);
    };
    /**
     * Connects a receive endpoint to the bus
     *
     * @remarks
     * Once connected, the receive endpoint will remain connected until disconnected
     *
     * @param queueName - The input queue name
     * @param cb - The configuration callback, used to add message handlers, etc.
     * @param options - Options for the receive endpoint, such as queue/exchange properties, etc.
     * @returns Nothing yet, but should return the receive endpoint so that it can be stopped
     *
     */
    MassTransitBus.prototype.receiveEndpoint = function (queueName, cb, options) {
        var _this_1 = this;
        var _a;
        if (options === void 0) { options = receiveEndpoint_1.defaultReceiveEndpointOptions; }
        var endpoint = new receiveEndpoint_1.ReceiveEndpoint(this, queueName, __assign(__assign({}, receiveEndpoint_1.defaultReceiveEndpointOptions), options));
        if (cb)
            cb(endpoint);
        (_a = this.connection) === null || _a === void 0 ? void 0 : _a.then(function (connection) { return endpoint.onConnect({ brokerUrl: _this_1.brokerUrl, connection: connection }); });
        return endpoint;
    };
    return MassTransitBus;
}(events_1.default));
var defaults = {
    host: "localhost",
};
function masstransit(options) {
    var _this_1 = this;
    if (options === void 0) { options = defaults; }
    var url = new URL("amqp://localhost/");
    var busOptions = __assign(__assign({}, defaults), options);
    if (process.env.RABBITMQ_HOST && process.env.RABBITMQ_HOST.length > 0)
        url.host = process.env.RABBITMQ_HOST;
    if (busOptions.host && busOptions.host.trim().length > 0)
        url.host = busOptions.host;
    if (busOptions.port && busOptions.port > 0)
        url.port = busOptions.port.toString();
    if (busOptions.virtualHost && busOptions.virtualHost.length > 0)
        url.pathname = busOptions.virtualHost.startsWith("/") ? busOptions.virtualHost : "/" + busOptions.virtualHost;
    var brokerUrl = url.toString();
    var bus = new MassTransitBus(brokerUrl);
    process.on("SIGINT", function () { return __awaiter(_this_1, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, bus.stop()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    return bus;
}
exports.default = masstransit;
