"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const standalone_logger_1 = __importDefault(require("standalone-logger"));
const log = standalone_logger_1.default(module);
const transferred_1 = __importDefault(require("../data-types/transferred"));
const chat_analysis_1 = __importDefault(require("./chat-analysis"));
const address_1 = __importDefault(require("./analysis/address"));
const handlers = [
    (msg) => {
        if (msg.indexOf('was') >= 0 && msg.indexOf('ist') >= 0) {
            if (msg.includes('justify') || msg.indexOf('das') >= 0) {
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
    },
    msg => {
        if (msg.indexOf('<3') >= 0) {
            return {
                type: 'emoji',
                author: 'bot',
                data: {
                    emoji: '❤️'
                }
            };
        }
        return null;
    }
];
const defaultAnswer = {
    type: 'text',
    author: 'bot',
    data: {
        text: 'Wie bitte?'
    }
};
let emojiAnswers = ['😄', '😜', '🤫', '🧐', '🤔', '🤨', '🤪', '🥳'];
function chatSession(io) {
    io.on('connect', sock => {
        sock.on('chat:msg', async (msg) => {
            if (transferred_1.default.isBCTextMessage(msg)) {
                let toAnalyze = msg.data.text;
                const printAnalysis = toAnalyze.startsWith('analyze:');
                if (printAnalysis)
                    toAnalyze = toAnalyze.substr(8);
                const analysis = await chat_analysis_1.default(toAnalyze);
                if (printAnalysis) {
                    let answer = {
                        author: 'bot',
                        type: 'text',
                        data: {
                            text: JSON.stringify(analysis, null, 4)
                        }
                    };
                    sock.emit('chat:msg', answer);
                    return;
                }
                const addr = address_1.default(analysis);
                if (addr) {
                    let answer = {
                        author: 'bot',
                        type: 'text',
                        data: {
                            text: 'Deine Adresse lautet also ' + String(addr)
                        }
                    };
                    sock.emit('chat:msg', answer);
                    return;
                }
                const txt = msg.data.text.toLowerCase();
                for (let i = 0; i < handlers.length; i++) {
                    let matched = handlers[i](txt);
                    if (matched !== null) {
                        sock.emit('chat:msg', matched);
                        return;
                    }
                }
                sock.emit('chat:msg', defaultAnswer);
            }
            else if (transferred_1.default.isBCEmojiMessage(msg)) {
                let answer = {
                    author: 'bot',
                    type: 'emoji',
                    data: {
                        emoji: emojiAnswers[Math.random() * emojiAnswers.length | 0]
                    }
                };
                sock.emit('chat:msg', answer);
            }
            else if (transferred_1.default.isFileMessage(msg)) {
                let answer = {
                    author: 'bot',
                    type: 'text',
                    data: {
                        text: ([
                            'Warum lädst du eine Datei hoch?!',
                            'Was soll ich damit?'
                        ])[Math.random() * 2 | 0]
                    }
                };
                sock.emit('chat:msg', answer);
            }
        });
    });
}
exports.default = chatSession;
//# sourceMappingURL=chat-session.js.map