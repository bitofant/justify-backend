// const { Firestore } = require ('@google-cloud/firestore');
import Firestore = require ('@google-cloud/firestore');

// Create a new client
const firestore = new Firestore.Firestore ({
	keyFilename: 'firestore-credentials.json'
});

export default firestore;


// interface iWriteResult {
// 	writeTime: {
// 		seconds: number,
// 		nanoseconds: number
// 	}
// }


// interface iDocumentSnapshot {
// 	onSnapshot: (callback: (snapshot: iDocumentSnapshot) => void) => () => void;

// }


// interface iDocumentReference<T> {
// 	id: string;
// 	parent: iCollection<T>;
// 	path: string;
// 	delete: () => Promise<iWriteResult>;
// 	get: () => Promise<iDocumentSnapshot>;
// }


// interface iQuery<T> {
// 	get: () => Promise<iQuerySnapshot<T>>;
// }
// interface iQuerySnapshot<T> {
// 	// https://cloud.google.com/nodejs/docs/reference/firestore/1.3.x/QuerySnapshot
// }


// interface iCollection<T> {

// 	add: (doc: T) => Promise<iDocumentReference<T>>;
// 	doc: (id: string) => Promise<iDocumentReference<T>>;
// 	where: (fieldPath: string, operator: '<'|'<='|'>'|'>='|'=='|'!=', value: string|number) => iQuery<T>
// 	listDocuments: () => Promise<iDocumentReference<T>[]>;

// }


// function collection<T> (name: string): iCollection<T> {
// 	return firestore.collection (name) as iCollection<T>;
// }

// export default collection;


// // firestore
// // 	.doc ('tokens/AjGskxHOhs96gMbqeZxK')
// // 	.update ({
// // 		created: Date.now (),
// // 		validThru: Date.now () + 10 * 24 * 60 * 60 * 1000
// // 	})
// // 	.then ((res: any) => {
// // 		console.log (res);
// // 	})
// // 	.catch ((err: any) => {
// // 		console.log (err);
// // 	});

// firestore
// 	.doc ('tokens/AjGskxHOhs96gMbqeZxK')
// 	.get ()
// 	.then ((snapshot: any) => {
// 		console.log (JSON.stringify(snapshot.data(), null, 4));
// 	})
// 	.catch ((err: any) => {
// 		console.log (err);
// 	});
