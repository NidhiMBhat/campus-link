import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";
import { getDistanceKm } from "../utils/distance";

const DEFAULT_RADIUS_KM = 10;

// --- 1. Permission Logic ---
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notifications");
    return false;
  }

  if (Notification.permission === "granted") return true;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

// --- 2. System Popup Logic ---
function triggerSystemNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body: body,
      icon: "/logo192.png",
      vibrate: [200, 100, 200],
    });
  }
}

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
    if (request.ownerId === currentUser.uid) continue;
    
    // Skip if we already marked this in User Profile
    if (notifiedRequests.includes(requestId)) continue;

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
      distance
    );

    if (distance <= radius) {
      // --- Fix: Unique ID to prevent duplicates ---
      const uniqueNotificationId = `${currentUser.uid}_${requestId}`;
      
      const notificationData = {
        userId: currentUser.uid,
        type: "REQUEST_NEARBY",
        message: `New request near ${request.source.name}`,
        requestId,
        distance: distance.toFixed(2),
        read: false,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "notifications", uniqueNotificationId), notificationData);

      triggerSystemNotification("CampusLink Alert", `New task available at ${request.source.name}!`);

      await updateDoc(userRef, {
        notifiedRequests: arrayUnion(requestId),
      });

      createdNotifications.push(requestId);
    }
  }

  return createdNotifications.length
    ? `Notifications created for: ${createdNotifications.join(", ")}`
    : "No new notifications.";
}

export async function createNotification({ userId, message, requestId = null }) {
  if (requestId) {
    const uniqueId = `${userId}_${requestId}_manual`;
    await setDoc(doc(db, "notifications", uniqueId), {
      userId,
      message,
      requestId,
      read: false,
      createdAt: serverTimestamp(),
    });
    triggerSystemNotification("CampusLink Update", message);
  } else {
    // Fallback for generic messages
    const newRef = doc(collection(db, "notifications"));
    await setDoc(newRef, {
      userId,
      message,
      requestId,
      read: false,
      createdAt: serverTimestamp(),
    });
    triggerSystemNotification("CampusLink Update", message);
  }
}

export async function markRead(notificationId) {
  await updateDoc(doc(db, "notifications", notificationId), {
    read: true,
  });
}