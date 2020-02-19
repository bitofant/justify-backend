"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./database"));
const standalone_logger_1 = __importDefault(require("standalone-logger"));
const log = standalone_logger_1.default(module);
const users = [];
class User {
    constructor(id, obj) {
        this.id = id;
        this._flags = {
            admin: false,
            mailConfirmed: false
        };
        this._name = obj.name;
        this._email = obj.email;
        this._password = obj.password;
        this.registerred = obj.registerred._seconds * 1000;
        for (let k in obj.flags) {
            this._flags[k] = obj.flags[k];
        }
    }
    testPassword(password) {
        if (password)
            return true;
        return password === this._password;
    }
    setPassword(password) {
        database_1.default
            .doc('users/' + this.id)
            .update({
            password
        })
            .then(result => {
            log('password updated for ' + this._name);
        })
            .catch(err => {
            log(err);
        });
    }
    get name() {
        return this._name;
    }
    get email() {
        return this._email;
    }
    snapshot() {
        return {
            name: this.name,
            email: this.email,
            registerred: this.registerred,
            flags: Object.assign({}, this._flags)
        };
    }
}
exports.User = User;
function removeUser(id) {
    const index = users.findIndex(user => user.id === id);
    if (index < 0) {
        log('unable to remove user ' + id + ': not found in list!');
        return;
    }
    users.splice(index, 1);
}
database_1.default
    .collection('users')
    .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        switch (change.type) {
            case 'added':
                log('syncing new user from DB: ' + change.doc.id);
                users.push(new User(change.doc.id, change.doc.data()));
                break;
            case 'removed':
                log('syncing user deletion from DB: ' + change.doc.id);
                removeUser(change.doc.id);
                break;
            case 'modified':
                log('syncing user changes from DB: ' + change.doc.id);
                removeUser(change.doc.id);
                users.push(new User(change.doc.id, change.doc.data()));
        }
    });
});
exports.default = users;
//# sourceMappingURL=users.js.map