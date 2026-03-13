
import { db } from "./firebase-admin";

async function fixSecurityMetadata() {
    console.log("=== Fixing Security Metadata ===");
    const eventId = "kosen-fes-2026";

    // 1. floorMaps
    const floorMaps = await db.collection("floorMaps").get();
    console.log(`Processing ${floorMaps.size} floor maps...`);
    const fmBatch = db.batch();
    floorMaps.docs.forEach(doc => {
        fmBatch.update(doc.ref, {
            eventId: eventId,
            isPublished: true
        });
    });
    await fmBatch.commit();

    // 2. ocrResults
    const ocrResults = await db.collection("ocrResults").get();
    console.log(`Processing ${ocrResults.size} ocr results...`);
    const ocrBatch = db.batch();
    ocrResults.docs.forEach(doc => {
        ocrBatch.update(doc.ref, {
            eventId: eventId,
            isPublished: true
        });
    });
    await ocrBatch.commit();

    console.log("Done!");
}

fixSecurityMetadata().catch(console.error);
