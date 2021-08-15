"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRepositoryInfo = void 0;
const BaseSchema_1 = require("./BaseSchema");
const createRepositoryInfo = (props) => {
    let obj = Object.assign(Object.assign({}, BaseSchema_1.createBaseSchema()), { isSelected: false, name: "", path: "" });
    if (props)
        obj = Object.assign(Object.assign({}, obj), props);
    return obj;
};
exports.createRepositoryInfo = createRepositoryInfo;
