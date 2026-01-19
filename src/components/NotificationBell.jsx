import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function NotificationBell({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setNotifications(data);
    });

    return () => unsub();
  }, [currentUser]);

  const markRead = async (id) => {
    await updateDoc(doc(db, "notifications", id), {
      isRead: true,
    });
  };
  const handleBellClick = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length > 0) {
      await Promise.all(unread.map((n) => markRead(n.id)));
    }
    navigate("/tasks"); // Navigate after marking all read
  };

  return (
    <div style={{ position: "relative", textAlign: "center" }}>
      {/* Bell itself */}
      <div
        onClick={handleBellClick}
        style={{ cursor: "pointer", fontSize: "24px" }}
      >
        🔔
        {/* Tiny unread count below */}
        {notifications.filter((n) => !n.isRead).length > 0 && (
          <div
            style={{
              fontSize: "10px",
              color: "white",
              marginTop: "2px",
            }}
          >
            {notifications.filter((n) => !n.isRead).length}
          </div>
        )}
      </div>


      
    </div>
  );
  
  
}
