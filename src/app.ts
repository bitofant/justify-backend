import logger, { loggerExpressEndpoint, LoggerSettings } from 'standalone-logger';
const log = logger (module);
// import './database/users';
// import './database/tokens';

const HTTP_PORT = (function () {
	if (process.env.PORT) {
		return parseInt (process.env.PORT);
	} else if (process.env.HTTP_PORT) {
		return parseInt (process.env.HTTP_PORT);
	}
	return 8081;
}) ();

import http = require ('http');
import express = require ('express');
import io = require ('socket.io');
import login from './login/login';
import chat from './chat/chat';
import chatSession from './chat/chat-session';

const app = express ();
const httpServer = http.createServer (app);
const socketIo = io (httpServer);
chatSession (socketIo);

// mount static files
if (process && process.env && process.env.NODE_ENV !== 'production') {
	log ('** dev-mode ** mounting static files from "/../../justify-frontend/dist/"');
	app.use (express.static (__dirname + '/../../justify-frontend/dist/'));
} else {
	log ('** prod-mode ** mounting static files from "/htdocs/"');
	app.use (express.static (__dirname + '/htdocs/'));
}

// mount API endpoints
app.use ('/api/login', login);
// app.use ('/api/chat', chat);
app.use ('/log', ...protectedLoggerEndpoint ());

// other endpoints
app.get ('/health', (req, res) => {
	res.status (200).send ('+HEALTHY');
});
app.get ('/ram', (req, res) => {
	res.status (200).send ((process.memoryUsage ().rss >> 10).toString ());
});


// start server
httpServer.listen (HTTP_PORT, () => {
	log ('server listening on port ' + HTTP_PORT);
});

let a: express.RequestHandler = (req, res, next) => {}

function protectedLoggerEndpoint (): express.RequestHandler[] {
	let userAndPassword = 'log:password!';
	if (process.env.LOGGING_AUTH) {
		userAndPassword = process.env.LOGGING_AUTH;
	}
	const logPW = 'Basic ' + Buffer.from (userAndPassword, 'utf8').toString ('base64');
	return [
		(req, res, next) => {
			const auth = req.headers.authorization;
			if (auth && auth === logPW) next ();
			else res.status (401).header ('WWW-Authenticate', 'Basic').send ('access denied');
		},
		loggerExpressEndpoint
	];
}
import './chat/chat-analysis';
