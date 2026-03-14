
import { db } from "./firebase-admin";

async function checkSpecificDoc() {
    const id = "0i2SYj4oSFGZC6HMjtvf";
    const collections = ["ocrResults", "floorMaps", "buildings", "locations"];

    console.log(`=== Checking ID: ${id} ===`);
    for (const col of collections) {
        const doc = await db.collection(col).doc(id).get();
        if (doc.exists) {
            console.log(`Found in [${col}]!`);
            const data = doc.data();
            console.log(`Data:`, JSON.stringify(data, null, 2));
        } else {
            console.log(`Not found in [${col}]`);
        }
    }
}

checkSpecificDoc().catch(console.error);
