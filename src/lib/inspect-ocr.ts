
import { db } from "./firebase-admin";

async function inspectOcrResults() {
    console.log("=== OCR Results Inspection ===");
    const snap = await db.collection("ocrResults").limit(5).get();

    if (snap.empty) {
        console.log("No OCR results found.");
        return;
    }

    snap.docs.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`BuildingID: ${data.buildingId}`);
        console.log(`Floor: ${data.floorNumber}`);
        console.log(`Extracted Texts: ${data.extractedTexts?.slice(0, 3)}...`);
        console.log("Room Candidates (first 2):", JSON.stringify(data.roomCandidates?.slice(0, 2), null, 2));
        if (data.simplifiedMapData) {
            console.log("Simplified Map Data:", JSON.stringify(data.simplifiedMapData, null, 2));
        }
        console.log("---");
    });
}

inspectOcrResults().catch(console.error);
