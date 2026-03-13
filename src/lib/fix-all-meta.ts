
import { db } from "./firebase-admin";

async function fixAllMetas() {
    const collections = ["locations", "notices"];
    console.log("=== Fixing isPublished for locations and notices ===");

    for (const col of collections) {
        const snap = await db.collection(col).get();
        console.log(`Processing ${snap.size} docs in ${col}...`);
        const batch = db.batch();
        snap.docs.forEach(doc => {
            batch.update(doc.ref, { isPublished: true });
        });
        await batch.commit();
    }
    console.log("Done!");
}

fixAllMetas().catch(console.error);
