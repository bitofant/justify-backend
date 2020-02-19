"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Address {
    static fromLanguageResult(res) {
        const data = res.metadata;
        return new Address({
            street: data.street_name,
            streetNumber: data.street_number,
            town: data.locality,
            zip: data.postal_code,
            country: data.country
        });
    }
    constructor(data) {
        this.street = data.street;
        this.streetNumber = data.streetNumber;
        this.town = data.town;
        this.zip = data.zip;
        this.country = data.country;
    }
    toString() {
        return [
            `${this.street} ${this.streetNumber}`,
            `${this.zip} ${this.town}`,
            this.country
        ].join('\n');
    }
}
function getAddress(entities) {
    const addrEntity = entities.find(entity => entity.type === 'ADDRESS');
    if (!addrEntity)
        return null;
    const address = Address.fromLanguageResult(addrEntity);
    return address;
}
exports.default = getAddress;
//# sourceMappingURL=address.js.map