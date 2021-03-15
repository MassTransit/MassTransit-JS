"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionContext = void 0;
var ConnectionContext = /** @class */ (function () {
    function ConnectionContext(connection, brokerUrl) {
        this.connection = connection;
        this.brokerUrl = brokerUrl;
    }
    return ConnectionContext;
}());
exports.ConnectionContext = ConnectionContext;
