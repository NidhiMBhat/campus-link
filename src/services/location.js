import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";


export function requestAndStoreLocation(user) {
  if (!user) return;

  if (!navigator.geolocation) {
    console.error("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        await updateDoc(doc(db, "users", user.uid), {
          lastKnownLocation: {
            lat: latitude,
            lng: longitude,
            updatedAt: serverTimestamp(),
          },
          locationPermission: "granted",
        });
      } catch (err) {
        console.error("Failed to update location", err);
      }
    },
    async (error) => {
      console.warn("Location permission denied");

      await updateDoc(doc(db, "users", user.uid), {
        locationPermission: "denied",
      });
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}
