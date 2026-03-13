
import { db } from "./firebase-admin";

async function checkEvent() {
    const eventId = "kosen-fes-2026";
    const doc = await db.collection("events").doc(eventId).get();
    if (doc.exists) {
        console.log(`Event ${eventId} exists:`, doc.data());
    } else {
        console.log(`Event ${eventId} DOES NOT EXIST.`);
        // List all events
        const all = await db.collection("events").get();
        console.log("All event IDs:", all.docs.map(d => d.id));
    }
}

checkEvent().catch(console.error);
