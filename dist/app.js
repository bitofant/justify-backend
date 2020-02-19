"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const standalone_logger_1 = __importStar(require("standalone-logger"));
const log = standalone_logger_1.default(module);
// import './database/users';
// import './database/tokens';
const HTTP_PORT = (function () {
    if (process.env.PORT) {
        return parseInt(process.env.PORT);
    }
    else if (process.env.HTTP_PORT) {
        return parseInt(process.env.HTTP_PORT);
    }
    return 8081;
})();
const http = require("http");
const express = require("express");
const io = require("socket.io");
const login_1 = __importDefault(require("./login/login"));
const chat_session_1 = __importDefault(require("./chat/chat-session"));
const app = express();
const httpServer = http.createServer(app);
const socketIo = io(httpServer);
chat_session_1.default(socketIo);
// mount static files
if (process && process.env && process.env.NODE_ENV !== 'production') {
    log('** dev-mode ** mounting static files from "/../../justify-frontend/dist/"');
    app.use(express.static(__dirname + '/../../justify-frontend/dist/'));
}
else {
    log('** prod-mode ** mounting static files from "/htdocs/"');
    app.use(express.static(__dirname + '/htdocs/'));
}
// mount API endpoints
app.use('/api/login', login_1.default);
// app.use ('/api/chat', chat);
app.use('/log', ...protectedLoggerEndpoint());
// other endpoints
app.get('/health', (req, res) => {
    res.status(200).send('+HEALTHY');
});
app.get('/ram', (req, res) => {
    res.status(200).send((process.memoryUsage().rss >> 10).toString());
});
// start server
httpServer.listen(HTTP_PORT, () => {
    log('server listening on port ' + HTTP_PORT);
});
let a = (req, res, next) => { };
function protectedLoggerEndpoint() {
    let userAndPassword = 'log:password!';
    if (process.env.LOGGING_AUTH) {
        userAndPassword = process.env.LOGGING_AUTH;
    }
    const logPW = 'Basic ' + Buffer.from(userAndPassword, 'utf8').toString('base64');
    return [
        (req, res, next) => {
            const auth = req.headers.authorization;
            if (auth && auth === logPW)
                next();
            else
                res.status(401).header('WWW-Authenticate', 'Basic').send('access denied');
        },
        standalone_logger_1.loggerExpressEndpoint
    ];
}
require("./chat/chat-analysis");
//# sourceMappingURL=app.js.map