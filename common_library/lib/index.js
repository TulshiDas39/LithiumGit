"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sayGoodbye = exports.sayHello = void 0;
var hello_world_1 = require("./hello-world");
Object.defineProperty(exports, "sayHello", { enumerable: true, get: function () { return hello_world_1.sayHello; } });
Object.defineProperty(exports, "sayGoodbye", { enumerable: true, get: function () { return hello_world_1.sayGoodbye; } });
__exportStar(require("./schemas"), exports);
__exportStar(require("./constants"), exports);
