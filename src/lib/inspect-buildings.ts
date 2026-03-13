
import { db } from "./firebase-admin";

async function inspectBuildings() {
    const snap = await db.collection("buildings").limit(5).get();
    console.log(`Found ${snap.size} buildings.`);
    snap.docs.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id}, Name: ${data.name}, eventId: ${data.eventId}, isPublished: ${data.isPublished} (type: ${typeof data.isPublished})`);
    });
}

inspectBuildings().catch(console.error);
