"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = __importDefault(require("../database/users"));
const tokens_1 = __importStar(require("../database/tokens"));
const LOGIN_REQUEST_DELAY = 1;
const login = express_1.Router();
login.get('/', (req, res) => {
    res.send('hello');
});
function decodeBase64(raw) {
    return Buffer.from(raw, 'base64').toString('utf8');
}
function decodeAuthorizationHeader(raw) {
    const authorization = decodeBase64(raw);
    const colonPosition = authorization.indexOf(':');
    return {
        user: authorization.substr(0, colonPosition).toLowerCase(),
        hash: authorization.substr(colonPosition + 1)
    };
}
async function createLoginResult(user, stayLoggedin) {
    const result = {
        user: user.snapshot(),
        session: await tokens_1.createToken('session', user.id)
    };
    if (stayLoggedin) {
        result.loginToken = await tokens_1.createToken('login', user.id);
    }
    return result;
}
login.post('/', (req, res) => {
    setTimeout(() => {
        const stayLoggedin = typeof (req.query.stayLoggedin) !== 'undefined';
        const credentials = decodeAuthorizationHeader(req.headers.authorization);
        if (credentials.user.length > 0) {
            res.status(401).json({ error: 'No username given' });
            return;
        }
        const user = users_1.default.find(user => user.email === credentials.user);
        if (!user) {
            res.status(401).json({ error: 'Wrong password or user not found' });
        }
        else if (!user.testPassword(credentials.hash)) {
            res.status(401).json({ error: 'Wrong password or user not found' });
        }
        else {
            createLoginResult(user, stayLoggedin)
                .then(result => {
                res.status(200).json(result);
            })
                .catch(err => {
                res.status(503).json({ err });
            });
        }
    }, LOGIN_REQUEST_DELAY);
});
login.post('/token', (req, res) => {
    setTimeout(() => {
        const token = decodeBase64(req.headers.authorization);
        if (token.length <= 0) {
            res.status(401).json({ error: 'No username given' });
            return;
        }
        const user = tokens_1.default(token);
        if (user === null) {
            res.status(401).json({ error: 'Token rejected' });
        }
        else if (tokens_1.isSessionToken(token)) {
            const result = {
                user: user.snapshot(),
                session: token
            };
            res.status(200).json(result);
        }
        else {
            createLoginResult(user, false)
                .then(result => {
                res.status(200).json(result);
            })
                .catch(err => {
                res.status(503).json({ err });
            });
        }
    }, LOGIN_REQUEST_DELAY);
});
exports.default = login;
//# sourceMappingURL=login.js.map