import { db } from "../firebase";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

export const completeTask = async (task, userRole) => {
  const taskRef = doc(db, "requests", task.id);
  const isRequester = userRole === "requester";
  
  return await runTransaction(db, async (transaction) => {
    const taskSnap = await transaction.get(taskRef);
    if (!taskSnap.exists()) throw new Error("Task not found");
    
    const taskData = taskSnap.data();

    // Determine the new states based on who is clicking
    const newRequesterConfirmed = isRequester ? true : (taskData.requesterConfirmed || false);
    const newHelperConfirmed = !isRequester ? true : (taskData.helperConfirmed || false);

    // If BOTH will be true after this update, perform the credit transfer
    if (newRequesterConfirmed && newHelperConfirmed) {
      const requesterRef = doc(db, "users", taskData.requesterId);
      const helperRef = doc(db, "users", taskData.helperId);
      
      const rSnap = await transaction.get(requesterRef);
      const hSnap = await transaction.get(helperRef);
      
      if (!rSnap.exists() || !hSnap.exists()) throw new Error("User data missing");

      const currentRequesterCredits = rSnap.data().credits || 0;
      const reward = taskData.credits || 0;

      if (currentRequesterCredits < reward) {
        throw new Error("Requester has insufficient credits for this transfer.");
      }

      // 💸 Execute Transfer
      transaction.update(requesterRef, { credits: currentRequesterCredits - reward });
      transaction.update(helperRef, { credits: (hSnap.data().credits || 0) + reward });
      
      // ✅ Finalize Task
      transaction.update(taskRef, {
        status: "Completed",
        requesterConfirmed: true,
        helperConfirmed: true,
        completedAt: serverTimestamp()
      });
    } else {
      // ⏳ Just mark the current user's part as done
      transaction.update(taskRef, {
        requesterConfirmed: newRequesterConfirmed,
        helperConfirmed: newHelperConfirmed
      });
    }
  });
};