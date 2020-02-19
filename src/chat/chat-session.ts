import logger from 'standalone-logger';
const log = logger (module);
import transferred from '../data-types/transferred';
import analyze from './chat-analysis';
import getAddress from './analysis/address';


const handlers: Array<(msg: string) => transferred.BCMessage> = [
	(msg: string) => {
		if (msg.indexOf ('was') >= 0 && msg.indexOf ('ist') >= 0) {
			if (msg.includes ('justify') || msg.indexOf ('das') >= 0) {
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
	},
	msg => {
		if (msg.indexOf ('<3') >= 0) {
			return {
				type: 'emoji',
				author: 'bot',
				data: {
					emoji: '❤️'
				}
			};
		}
		return null;
	}
];

const defaultAnswer: transferred.BCTextMessage = {
	type: 'text',
	author: 'bot',
	data: {
		text: 'Wie bitte?'
	}
};


let emojiAnswers = ['😄', '😜', '🤫', '🧐', '🤔', '🤨', '🤪', '🥳'];
function chatSession (io: SocketIO.Server) {
	io.on ('connect', sock => {
		
		sock.on ('chat:msg', async (msg: transferred.BCMessage) => {
			if (transferred.isBCTextMessage (msg)) {
				let toAnalyze = msg.data.text;
				const printAnalysis = toAnalyze.startsWith ('analyze:');
				if (printAnalysis) toAnalyze = toAnalyze.substr (8);
				const analysis = await analyze (toAnalyze);
				if (printAnalysis) {
					let answer: transferred.BCTextMessage = {
						author: 'bot',
						type: 'text',
						data: {
							text: JSON.stringify (analysis, null, 4)
						}
					};
					sock.emit ('chat:msg', answer);
					return;
				}
				const addr = getAddress (analysis);
				if (addr) {
					let answer: transferred.BCTextMessage = {
						author: 'bot',
						type: 'text',
						data: {
							text: 'Deine Adresse lautet also ' + String(addr)
						}
					};
					sock.emit ('chat:msg', answer);
					return;
				}
				const txt = msg.data.text.toLowerCase ();
				for (let i = 0; i < handlers.length; i++) {
					let matched = handlers[i] (txt);
					if (matched !== null) {
						sock.emit ('chat:msg', matched);
						return;
					}
				}
				sock.emit ('chat:msg', defaultAnswer);
			} else if (transferred.isBCEmojiMessage (msg)) {
				let answer: transferred.BCEmojiMessage = {
					author: 'bot',
					type: 'emoji',
					data: {
						emoji: emojiAnswers[Math.random () * emojiAnswers.length | 0]
					}
				}
				sock.emit ('chat:msg', answer);
			} else if (transferred.isFileMessage (msg)) {
				let answer: transferred.BCTextMessage = {
					author: 'bot',
					type: 'text',
					data: {
						text: ([
							'Warum lädst du eine Datei hoch?!',
							'Was soll ich damit?'
						])[Math.random () * 2 | 0]
					}
				};
				sock.emit ('chat:msg', answer);
			}
		});

	});
}

export default chatSession;
