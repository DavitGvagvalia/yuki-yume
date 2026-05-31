// functions/index.js
import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize the Admin SDK
initializeApp();
const db = getFirestore();

const RESTAURANT_LAT = 37.017;
const RESTAURANT_LNG = -7.933;
const MAX_DISTANCE_KM = 5.0;

// Haversine formula helper
function getHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export const submitOrder = onRequest({ cors: true }, async (req, res) => {
    try {
        const { cart, customerInfo, deliveryCoordinates } = req.body;
        const { lat, lng } = deliveryCoordinates;

        // Verify the radius securely on the server
        const distance = getHaversineDistance(RESTAURANT_LAT, RESTAURANT_LNG, lat, lng);

        if (distance > MAX_DISTANCE_KM) {
            return res.status(400).json({ 
                success: false, 
                message: `Delivery address is ${distance.toFixed(2)}km away. We only deliver within 5km.` 
            });
        }

        // Save order to Firestore using the admin instance
        const orderRef = await db.collection("orders").add({
            cart,
            customerInfo,
            deliveryCoordinates: { lat, lng },
            distanceKm: parseFloat(distance.toFixed(2)),
            status: "pending",
            createdAt: FieldValue.serverTimestamp()
        });

        return res.status(200).json({ success: true, orderId: orderRef.id });

    } catch (error) {
        console.error("Order processing error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});