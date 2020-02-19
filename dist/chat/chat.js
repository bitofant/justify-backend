"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transferred_1 = __importDefault(require("../data-types/transferred"));
const bodyParser = require("body-parser");
const standalone_logger_1 = __importDefault(require("standalone-logger"));
const log = standalone_logger_1.default(module);
const chat = express_1.Router();
chat.use(bodyParser.json());
const handlers = [
    (msg) => {
        if (msg.indexOf('was') >= 0 && msg.indexOf('ist') >= 0) {
            if (msg.indexOf('justify') >= 0 || msg.indexOf('das') >= 0) {
                return {
                    author: 'bot',
                    type: 'text',
                    data: {
                        text: 'Justify ist ein junges Startup im Aufbau :-)'
                    },
                    suggestions: [
                        'Wann ist es fertig?',
                        'Ich mag Justify <3'
                    ]
                };
            }
        }
        return null;
    }
];
let emojiAnswers = ['😄', '😜', '🤫', '🧐', '🤔', '🤨', '🤪', '🥳'];
chat.post('/message', (req, res) => {
    const msg = req.body;
    log(JSON.stringify(req.headers, null, 4));
    if (transferred_1.default.isBCTextMessage(msg)) {
        const txt = msg.data.text.toLowerCase();
        for (let i = 0; i < handlers.length; i++) {
            let matched = handlers[i](txt);
            if (matched !== null) {
                res.status(200).json(matched);
                return;
            }
        }
    }
    else if (transferred_1.default.isBCEmojiMessage(msg)) {
        let answer = {
            author: 'bot',
            type: 'emoji',
            data: {
                emoji: emojiAnswers[Math.random() * emojiAnswers.length | 0]
            }
        };
        res.status(200).json(answer);
        return;
    }
    else if (transferred_1.default.isFileMessage(msg)) {
    }
    res.status(200).json({
        author: 'bot',
        type: 'text',
        data: {
            text: 'Sorry, die Frage habe ich leider nicht verstanden :-('
        }
    });
});
exports.default = chat;
//# sourceMappingURL=chat.js.map