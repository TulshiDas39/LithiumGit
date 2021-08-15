"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBaseSchema = void 0;
const uuid_1 = require("uuid");
function createBaseSchema(props) {
    let obj = {
        _id: uuid_1.v4(),
        createdAt: new Date().toDateString(),
        updateAt: new Date().toDateString(),
    };
    if (props)
        obj = Object.assign(Object.assign({}, obj), props);
    return obj;
}
exports.createBaseSchema = createBaseSchema;
