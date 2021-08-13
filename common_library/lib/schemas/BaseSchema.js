"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSchema = void 0;
class BaseSchema {
    constructor() {
        this._id = "";
        this.createdAt = new Date().toISOString();
        this.updateAt = new Date().toISOString();
    }
}
exports.BaseSchema = BaseSchema;
