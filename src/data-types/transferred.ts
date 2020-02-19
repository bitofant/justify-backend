namespace DataTypes {

	export interface LoginCredentials {
		mail: string;
		pass: string;
		stayLoggedin?: boolean;
	}

	export interface User {
		name: string;
		email: string;
		registerred: number;
		flags: {
			admin: boolean;
			mailConfirmed: boolean;
			[key: string]: boolean;
		};
	}

	export interface LoginResult {
		user: User;
		session: string;
		loginToken?: string;
	}

	export interface BCMessage {
		type: string;
		author: string;
		data: any;
		suggestions?: string[];
	}

	export interface BCTextMessage extends BCMessage {
		type: 'text';
		data: {
			text: string;
		};
	}
	export function isBCTextMessage (obj: BCMessage): obj is BCTextMessage {
		return obj.type === 'text';
	}

	export interface BCEmojiMessage extends BCMessage {
		type: 'emoji';
		data: {
			emoji: string;
		};
	}
	export function isBCEmojiMessage (obj: BCMessage): obj is BCEmojiMessage {
		return obj.type === 'emoji';
	}

	export interface BCFileMessage extends BCMessage {
		type: 'file';
		data: {
			file: {};
		};
	}
	export function isFileMessage (obj: BCMessage): obj is BCFileMessage {
		return obj.type === 'file';
	}

}

export default DataTypes;
