"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtils = void 0;
const uuid_1 = require("uuid");
class StringUtils {
    static getFolderName(path) {
        let sep = "/";
        if (path.indexOf("\\") != -1)
            sep = "\\";
        return path.split(sep).pop() || "";
    }
    static uuidv4() {
        return uuid_1.v4();
    }
}
exports.StringUtils = StringUtils;
