
import { db } from "./firebase-admin";

async function simulateClient() {
    console.log("=== Simulating useEvent() ===");
    const eventSnap = await db.collection("events").where("isPublished", "==", true).limit(1).get();
    if (eventSnap.empty) {
        console.log("No published event found!");
        return;
    }
    const eventId = eventSnap.docs[0].id;
    console.log(`Found published event ID: ${eventId}`);

    console.log("=== Simulating useBuildings(eventId) ===");
    const buildingSnap = await db.collection("buildings")
        .where("eventId", "==", eventId)
        .where("isPublished", "==", true)
        .get();

    console.log(`Found ${buildingSnap.size} buildings for event ${eventId}.`);
}

simulateClient().catch(console.error);
