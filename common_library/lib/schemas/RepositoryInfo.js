"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryInfo = void 0;
const BaseSchema_1 = require("./BaseSchema");
class RepositoryInfo extends BaseSchema_1.BaseSchema {
    constructor(path, name, isSelected = false) {
        super();
        this.name = "";
        this.path = "";
        this.isSelected = false;
        this.path = path;
        this.name = name;
        this.isSelected = isSelected;
    }
}
exports.RepositoryInfo = RepositoryInfo;
