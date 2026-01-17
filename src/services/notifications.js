import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";
import { getDistanceKm } from "../utils/distance";

const DEFAULT_RADIUS_KM = 10;
let notifiedThisSession = new Set();

export async function checkNearbyRequests(currentUser) {
  if (!currentUser) return "No currentUser";

  const userRef = doc(db, "users", currentUser.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return "User doc not found";

  const userData = userSnap.data();
  if (!userData.lastKnownLocation) return "No lastKnownLocation";

  const { lat, lng } = userData.lastKnownLocation;
  const notifiedRequests = userData.notifiedRequests || [];

  const q = query(collection(db, "requests"), where("status", "==", "pending"));
  const snapshot = await getDocs(q);

  const createdNotifications = [];

  for (const snap of snapshot.docs) {
    const requestId = snap.id;
    const request = snap.data();

    if (!request.source?.location) continue;
    
    // Check if it's the user's own request
    // Note: Ensure your DB uses 'ownerId' or 'requesterId'. Keeping 'ownerId' as per your code.
    if (request.ownerId === currentUser.uid) continue;
    
    // 1. Fast Local Check
    if (notifiedRequests.includes(requestId) || notifiedThisSession.has(requestId)) continue;

    // --- FIX 1: Robust Database Duplicate Check ---
    // This prevents "Double Notifications" if React runs this function twice
    const duplicateQuery = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      where("requestId", "==", requestId),
      where("type", "==", "REQUEST_NEARBY")
    );
    const duplicateSnap = await getDocs(duplicateQuery);
    
    // If notification already exists in DB, skip it
    if (!duplicateSnap.empty) {
      notifiedThisSession.add(requestId);
      continue; 
    }
    // ----------------------------------------------

    const radius = DEFAULT_RADIUS_KM;
    const distance = getDistanceKm(
      lat,
      lng,
      request.source.location.latitude,
      request.source.location.longitude
    );

    console.log(
      "Checking request:",
      request.source.name,
      "Distance:",
      distance,
      "Radius:",
      radius
    );

    if (distance <= radius) {
      await addDoc(collection(db, "notifications"), {
        userId: currentUser.uid,
        type: "REQUEST_NEARBY",
        message: `New request near ${request.source.name}`,
        requestId,
        distance: distance.toFixed(2),
        read: false, // FIX 2: Changed 'isRead' to 'read' to match NotificationBell logic
        createdAt: serverTimestamp(),
      });

      await updateDoc(userRef, {
        notifiedRequests: arrayUnion(requestId),
      });

      notifiedThisSession.add(requestId);
      createdNotifications.push(requestId);
    }
  }

  return createdNotifications.length
    ? `Notifications created for requests: ${createdNotifications.join(", ")}`
    : "No notifications created (no requests nearby)";
}

export async function createNotification({ userId, message, requestId = null }) {
  await addDoc(collection(db, "notifications"), {
    userId,
    message,
    requestId,
    read: false, // FIX 2: Changed 'isRead' to 'read'
    createdAt: serverTimestamp(),
  });
}

export async function markRead(notificationId) {
  await updateDoc(doc(db, "notifications", notificationId), {
    read: true, // FIX 2: Changed 'isRead' to 'read'
  });
}