import { Router } from 'express';
import transferred from '../data-types/transferred';
import bodyParser = require('body-parser');
import logger from 'standalone-logger';
const log = logger (module);

const chat = Router ();

chat.use (bodyParser.json ());

const handlers: Array<(msg: string) => transferred.BCMessage> = [
	(msg: string) => {
		if (msg.indexOf ('was') >= 0 && msg.indexOf ('ist') >= 0) {
			if (msg.indexOf ('justify') >= 0 || msg.indexOf ('das') >= 0) {
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
	}
];


let emojiAnswers = ['😄', '😜', '🤫', '🧐', '🤔', '🤨', '🤪', '🥳'];
chat.post ('/message', (req, res) => {
	const msg: transferred.BCMessage = req.body;
	log (JSON.stringify (req.headers, null, 4));
	if (transferred.isBCTextMessage (msg)) {
		const txt = msg.data.text.toLowerCase ();
		for (let i = 0; i < handlers.length; i++) {
			let matched = handlers[i] (txt);
			if (matched !== null) {
				res.status (200).json (matched);
				return;
			}
		}
	} else if (transferred.isBCEmojiMessage (msg)) {
		let answer: transferred.BCEmojiMessage = {
			author: 'bot',
			type: 'emoji',
			data: {
				emoji: emojiAnswers[Math.random () * emojiAnswers.length | 0]
			}
		}
		res.status (200).json (answer);
		return;
	} else if (transferred.isFileMessage (msg)) {
	}
	res.status (200).json ({
		author: 'bot',
		type: 'text',
		data: {
			text: 'Sorry, die Frage habe ich leider nicht verstanden :-('
		}
	});
});

export default chat;
