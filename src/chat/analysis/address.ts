import { LanguageResult } from "../chat-analysis";

class Address {
	public street: string;
	public streetNumber: string;
	public town: string;
	public zip: string;
	public country: string;

	public static fromLanguageResult (res: LanguageResult): Address {
		const data = res.metadata;
		return new Address ({
			street: data.street_name,
			streetNumber: data.street_number,
			town: data.locality,
			zip: data.postal_code,
			country: data.country
		});
	}

	constructor (data: {
		street: string;
		streetNumber: string;
		town: string;
		zip: string;
		country: string;
	}) {
		this.street = data.street;
		this.streetNumber = data.streetNumber;
		this.town = data.town;
		this.zip = data.zip;
		this.country = data.country;
	}

	public toString () {
		return [
			`${this.street} ${this.streetNumber}`,
			`${this.zip} ${this.town}`,
			this.country
		].join ('\n');
	}

}

function getAddress (entities: Array<LanguageResult>) {
	const addrEntity = entities.find (entity => entity.type === 'ADDRESS');
	if (!addrEntity) return null;
	const address = Address.fromLanguageResult (addrEntity);
	return address;
}

export default getAddress;
