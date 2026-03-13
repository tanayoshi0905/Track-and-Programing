
import { db } from "./firebase-admin";

async function inspectFloorMaps() {
    console.log("=== Floor Maps Inspection ===");
    const snap = await db.collection("floorMaps").get();

    if (snap.empty) {
        console.log("No floor maps found.");
        return;
    }

    snap.docs.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`BuildingID: ${data.buildingId}`);
        console.log(`Floor: ${data.floorNumber}`);
        console.log(`FileName: ${data.fileName}`);
        console.log(`OCR Status: ${data.ocrStatus}`);
        console.log("---");
    });
}

inspectFloorMaps().catch(console.error);
