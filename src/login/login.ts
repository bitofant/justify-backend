import { Router } from 'express';
import users, { User } from '../database/users';
import transferred from '../data-types/transferred';
import getUserByToken, { createToken, isSessionToken } from '../database/tokens';


const LOGIN_REQUEST_DELAY = 1;


const login = Router ();

login.get ('/', (req, res) => {
	res.send ('hello');
});


function decodeBase64 (raw: string): string {
	return Buffer.from (raw, 'base64').toString ('utf8');
}

function decodeAuthorizationHeader (raw: string): { user: string, hash: string } {
	const authorization = decodeBase64 (raw);
	const colonPosition = authorization.indexOf (':');
	return {
		user: authorization.substr (0, colonPosition).toLowerCase (),
		hash: authorization.substr (colonPosition + 1)
	};
}


async function createLoginResult (user: User, stayLoggedin: boolean): Promise<transferred.LoginResult> {
	const result: transferred.LoginResult = {
		user: user.snapshot (),
		session: await createToken ('session', user.id)
	};
	if (stayLoggedin) {
		result.loginToken = await createToken ('login', user.id);
	}
	return result;
}


login.post ('/', (req, res) => {
	setTimeout (() => {
		const stayLoggedin = typeof (req.query.stayLoggedin) !== 'undefined';
		const credentials = decodeAuthorizationHeader (req.headers.authorization);
		if (credentials.user.length > 0) {
			res.status (401).json ({ error: 'No username given' });
			return;
		}
		const user = users.find (user => user.email === credentials.user);
		if (!user) {
			res.status (401).json ({ error: 'Wrong password or user not found' });
		} else if (!user.testPassword (credentials.hash)) {
			res.status (401).json ({ error: 'Wrong password or user not found' });
		} else {
			createLoginResult (user, stayLoggedin)
				.then (result => {
					res.status (200).json (result);
				})
				.catch (err => {
					res.status (503).json ({ err });
				});
		}
	}, LOGIN_REQUEST_DELAY);
});


login.post ('/token', (req, res) => {
	setTimeout (() => {
		const token = decodeBase64 (req.headers.authorization);
		if (token.length <= 0) {
			res.status (401).json ({ error: 'No username given' });
			return;
		}
		const user = getUserByToken (token);
		if (user === null) {
			res.status (401).json ({ error: 'Token rejected' });
		} else if (isSessionToken (token)) {
			const result: transferred.LoginResult = {
				user: user.snapshot (),
				session: token
			};
			res.status (200).json (result);
		} else {
			createLoginResult (user, false)
				.then (result => {
					res.status (200).json (result);
				})
				.catch (err => {
					res.status (503).json ({ err });
				});
		}
	}, LOGIN_REQUEST_DELAY);
});

export default login;
