import logger from 'standalone-logger';
const log = logger (module);

import GLanguage = require ('@google-cloud/language');
const client = new GLanguage.LanguageServiceClient ({
	keyFilename: 'language-credentials.json'
});

interface LanguageResult {
	name: string;
	type: 'ADDRESS'|'NUMBER'|'OTHER'|'LOCATION';
	mentions: Array<{
		text: {
			content: string;
			beginOffset: number
		};
		type: 'COMMON'|'PROPER'|'TYPE_UNKNOWN';
		sentiment: null;
	}>;
	salience: number;
	sentiment: null;
	metadata: {
		[key: string]: string;
		mid?: string;
		wikipedia_url?: string;
		broad_region?: string;
		street_name?: string;
		street_number?: string;
		postal_code?: string;
		country?: string;
		locality?: string;
	};
}

async function analyze (text: string) {
	const document = {
		type: 'PLAIN_TEXT',
		content: text
	};

	const [result] = await client.analyzeEntities ({ document });
	const entities = result.entities;

	return entities as Array<LanguageResult>;
}

export { LanguageResult };
export default analyze;
