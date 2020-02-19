"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataTypes;
(function (DataTypes) {
    function isBCTextMessage(obj) {
        return obj.type === 'text';
    }
    DataTypes.isBCTextMessage = isBCTextMessage;
    function isBCEmojiMessage(obj) {
        return obj.type === 'emoji';
    }
    DataTypes.isBCEmojiMessage = isBCEmojiMessage;
    function isFileMessage(obj) {
        return obj.type === 'file';
    }
    DataTypes.isFileMessage = isFileMessage;
})(DataTypes || (DataTypes = {}));
exports.default = DataTypes;
//# sourceMappingURL=transferred.js.map