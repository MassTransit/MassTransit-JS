"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = void 0;
function delay(ms) {
    var handle;
    var promise = function () {
        return new Promise(function (resolve) {
            handle = setTimeout(resolve, ms);
            return handle;
        });
    };
    return { promise: promise, cancel: function () { return clearTimeout(handle); } };
}
exports.delay = delay;
