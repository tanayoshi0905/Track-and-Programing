
import { db } from "./firebase-admin";

async function checkAllCollections() {
    const collections = ["events", "buildings", "locations", "notices", "floorMaps", "ocrResults"];
    console.log("=== Collection Check ===");

    for (const col of collections) {
        const snap = await db.collection(col).limit(1).get();
        if (snap.empty) {
            console.log(`${col}: (empty)`);
            continue;
        }
        const data = snap.docs[0].data();
        console.log(`${col}: eventId=${data.eventId}, isPublished=${data.isPublished}`);
    }
}

checkAllCollections().catch(console.error);
