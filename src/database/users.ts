import firestore from './database';
import logger from 'standalone-logger';
import transferred from '../data-types/transferred';
const log = logger (module);


const users: User[] = [];
class User {

	private _name: string;
	private _email: string;
	private _password: string;
	public readonly registerred: number;
	private _flags: {
		admin: boolean,
		mailConfirmed: boolean,
		[key: string]: boolean
	} = {
		admin: false,
		mailConfirmed: false
	};

	constructor (readonly id: string, obj: any) {
		this._name = obj.name;
		this._email = obj.email;
		this._password = obj.password;
		this.registerred = obj.registerred._seconds * 1000;
		for (let k in obj.flags) {
			this._flags[k] = obj.flags[k];
		}
	}

	public testPassword (password: string) {
		if (password) return true;
		return password === this._password;
	}

	public setPassword (password: string) {
		firestore
			.doc ('users/' + this.id)
			.update ({
				password
			})
			.then (result => {
				log ('password updated for ' + this._name);
			})
			.catch (err => {
				log (err);
			});
	}


	public get name () {
		return this._name;
	}

	public get email () {
		return this._email;
	}

	public snapshot (): transferred.User {
		return {
			name: this.name,
			email: this.email,
			registerred: this.registerred,
			flags: Object.assign ({}, this._flags)
		};
	}

}

function removeUser (id: string) {
	const index = users.findIndex (user => user.id === id);
	if (index < 0) {
		log ('unable to remove user ' + id + ': not found in list!');
		return;
	}
	users.splice (index, 1);
}


firestore
	.collection ('users')
	.onSnapshot (snapshot => {
		snapshot.docChanges ().forEach (change => {
			switch (change.type) {
				case 'added':
					log ('syncing new user from DB: ' + change.doc.id);
					users.push (new User (change.doc.id, change.doc.data ()));
					break;
				case 'removed':
					log ('syncing user deletion from DB: ' + change.doc.id);
					removeUser (change.doc.id);
					break;
				case 'modified':
					log ('syncing user changes from DB: ' + change.doc.id);
					removeUser (change.doc.id);
					users.push (new User (change.doc.id, change.doc.data ()));
			}
		});
	});


export { User };
export default users;
