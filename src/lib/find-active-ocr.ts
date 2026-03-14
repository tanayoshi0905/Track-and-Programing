
import { db } from "./firebase-admin";

async function findActiveOcr() {
    console.log("=== Active OCR Results Check ===");
    // 「本館」「体育館」などの最新の情報を探す

    // 1. まず buildings を取得
    const buildingsSnap = await db.collection("buildings").get();
    for (const bDoc of buildingsSnap.docs) {
        const bData = bDoc.data();
        console.log(`Building: ${bData.name} (${bDoc.id})`);

        // 2. その建物の floorMaps を取得
        const fmSnap = await db.collection("floorMaps").where("buildingId", "==", bDoc.id).get();
        for (const fmDoc of fmSnap.docs) {
            const fmData = fmDoc.data();
            console.log(`  Floor: ${fmData.floorNumber}F (${fmDoc.id})`);

            // 3. そのフロアの ocrResults を取得
            const ocrSnap = await db.collection("ocrResults").where("sourceFloorMapId", "==", fmDoc.id).get();
            if (ocrSnap.empty) {
                console.log(`    OCR: (None)`);
            } else {
                ocrSnap.docs.forEach(ocrDoc => {
                    const ocrData = ocrDoc.data();
                    console.log(`    OCR ID: ${ocrDoc.id}`);
                    console.log(`    Rooms: ${ocrData.roomCandidates?.length ?? 0} candidates found.`);
                });
            }
        }
    }
}

findActiveOcr().catch(console.error);
