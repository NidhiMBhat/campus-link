import { db } from "../firebase";
import {
  doc,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { auth } from "../firebase";

export const completeTask = async (taskId) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const taskRef = doc(db, "tasks", taskId);

  await runTransaction(db, async (transaction) => {
    const taskSnap = await transaction.get(taskRef);
    if (!taskSnap.exists()) throw new Error("Task not found");

    const task = taskSnap.data();

    // 🔐 SAFETY CHECKS
    if (task.requesterId !== currentUser.uid)
      throw new Error("Only requester can complete task");

    if (task.status !== "Accepted")
      throw new Error("Task not in accepted state");

    const requesterRef = doc(db, "users", task.requesterId);
    const helperRef = doc(db, "users", task.helperId);

    const requesterSnap = await transaction.get(requesterRef);
    const helperSnap = await transaction.get(helperRef);

    if (!requesterSnap.exists() || !helperSnap.exists())
      throw new Error("User data missing");

    const requesterCredits = requesterSnap.data().credits || 0;
    const taskCredits = task.credits;

    if (requesterCredits < taskCredits)
      throw new Error("Insufficient credits");

    // 💸 TRANSFER CREDITS
    transaction.update(requesterRef, {
      credits: requesterCredits - taskCredits,
    });

    transaction.update(helperRef, {
      credits: (helperSnap.data().credits || 0) + taskCredits,
    });

    // ✅ COMPLETE TASK
    transaction.update(taskRef, {
      status: "Completed",
      completedAt: serverTimestamp(),
    });
  });
};
