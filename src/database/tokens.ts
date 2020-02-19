import firestore from "./database";
import logger from 'standalone-logger';
import users, { User } from "./users";
const log = logger (module);


const TOKEN_VALIDITY = {
	login: 90 * 24 * 60 * 60 * 1000,
	session: 24 * 60 * 60 * 1000
};


const tokens: Token[] = [];
class Token {

	public readonly type: 'login'|'session';
	private readonly userId: string;
	public readonly user: () => User;
	public readonly created: number;
	public readonly validThru: number;

	constructor (readonly id: string, obj: any) {
		this.type = obj.type;
		this.userId = obj.user.id;
		this.user = () => users.find (user => user.id === this.userId);
		this.created = obj.created;
		this.validThru = obj.validThru;
	}

	public extend () {
		// don't renew if >80% of validity-period is remaining;
		const now = Date.now ();
		if (this.validThru - now > (.8 * TOKEN_VALIDITY[this.type] | 0)) return;
		firestore
			.doc ('tokens/' + this.id)
			.update ({
				validThru: now + TOKEN_VALIDITY[this.type]
			})
			.then (res => {
				log ('updated token validity for ' + this.user ().name + '/' + this.id);
			})
			.catch (err => {
				log (err, 'red');
			});
	}

}

function removeToken (id: string) {
	const index = tokens.findIndex (token => token.id === id);
	if (index < 0) {
		log ('unable to remove token ' + id + ': not found in list!');
		return;
	}
	tokens.splice (index, 1);
}


firestore
	.collection ('tokens')
	.onSnapshot (snapshot => {
		snapshot.docChanges ().forEach (change => {
			switch (change.type) {
				case 'added':
					log ('syncing new token from DB: ' + change.doc.id);
					tokens.push (new Token (change.doc.id, change.doc.data ()));
					break;
				case 'removed':
					log ('syncing token deletion from DB: ' + change.doc.id);
					removeToken (change.doc.id);
					break;
				case 'modified':
					log ('syncing token changes from DB: ' + change.doc.id);
					removeToken (change.doc.id);
					tokens.push (new Token (change.doc.id, change.doc.data ()));
			}
		});
	});

function getUserByToken (token: string): User|null {
	const tok = tokens.find (t => t.id === token);
	if (tok && tok.validThru >= Date.now ()) {
		tok.extend ();
		return tok.user ();
	} else {
		return null;
	}
}

function isSessionToken (token: string): boolean {
	const tok = tokens.find (t => t.id === token);
	return tok && tok.type === 'session';
}

function createToken (type: 'login'|'session', userId: string): Promise<string> {
	return new Promise<string> ((resolve, reject) => {
		const now = Date.now ();
		firestore
			.collection ('tokens')
			.add ({
				type,
				user: firestore.doc ('user/' + userId),
				created: now,
				validThru: now + TOKEN_VALIDITY[type]
			})
			.then (res => resolve (res.id))
			.catch (err => reject (err));
	});
}

export { createToken, isSessionToken };
export default getUserByToken;
