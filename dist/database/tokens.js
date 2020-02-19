"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./database"));
const standalone_logger_1 = __importDefault(require("standalone-logger"));
const users_1 = __importDefault(require("./users"));
const log = standalone_logger_1.default(module);
const TOKEN_VALIDITY = {
    login: 90 * 24 * 60 * 60 * 1000,
    session: 24 * 60 * 60 * 1000
};
const tokens = [];
class Token {
    constructor(id, obj) {
        this.id = id;
        this.type = obj.type;
        this.userId = obj.user.id;
        this.user = () => users_1.default.find(user => user.id === this.userId);
        this.created = obj.created;
        this.validThru = obj.validThru;
    }
    extend() {
        // don't renew if >80% of validity-period is remaining;
        const now = Date.now();
        if (this.validThru - now > (.8 * TOKEN_VALIDITY[this.type] | 0))
            return;
        database_1.default
            .doc('tokens/' + this.id)
            .update({
            validThru: now + TOKEN_VALIDITY[this.type]
        })
            .then(res => {
            log('updated token validity for ' + this.user().name + '/' + this.id);
        })
            .catch(err => {
            log(err, 'red');
        });
    }
}
function removeToken(id) {
    const index = tokens.findIndex(token => token.id === id);
    if (index < 0) {
        log('unable to remove token ' + id + ': not found in list!');
        return;
    }
    tokens.splice(index, 1);
}
database_1.default
    .collection('tokens')
    .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        switch (change.type) {
            case 'added':
                log('syncing new token from DB: ' + change.doc.id);
                tokens.push(new Token(change.doc.id, change.doc.data()));
                break;
            case 'removed':
                log('syncing token deletion from DB: ' + change.doc.id);
                removeToken(change.doc.id);
                break;
            case 'modified':
                log('syncing token changes from DB: ' + change.doc.id);
                removeToken(change.doc.id);
                tokens.push(new Token(change.doc.id, change.doc.data()));
        }
    });
});
function getUserByToken(token) {
    const tok = tokens.find(t => t.id === token);
    if (tok && tok.validThru >= Date.now()) {
        tok.extend();
        return tok.user();
    }
    else {
        return null;
    }
}
function isSessionToken(token) {
    const tok = tokens.find(t => t.id === token);
    return tok && tok.type === 'session';
}
exports.isSessionToken = isSessionToken;
function createToken(type, userId) {
    return new Promise((resolve, reject) => {
        const now = Date.now();
        database_1.default
            .collection('tokens')
            .add({
            type,
            user: database_1.default.doc('user/' + userId),
            created: now,
            validThru: now + TOKEN_VALIDITY[type]
        })
            .then(res => resolve(res.id))
            .catch(err => reject(err));
    });
}
exports.createToken = createToken;
exports.default = getUserByToken;
//# sourceMappingURL=tokens.js.map