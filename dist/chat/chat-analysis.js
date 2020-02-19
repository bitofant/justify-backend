"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const standalone_logger_1 = __importDefault(require("standalone-logger"));
const log = standalone_logger_1.default(module);
const GLanguage = require("@google-cloud/language");
const client = new GLanguage.LanguageServiceClient({
    keyFilename: 'language-credentials.json'
});
async function analyze(text) {
    const document = {
        type: 'PLAIN_TEXT',
        content: text
    };
    const [result] = await client.analyzeEntities({ document });
    const entities = result.entities;
    return entities;
}
exports.default = analyze;
//# sourceMappingURL=chat-analysis.js.map