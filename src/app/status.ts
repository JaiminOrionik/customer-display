// src/app/status.ts
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "./firestore";

export type ActivityStatus = "billing" | "queue" | "active" | "inactive";

// Dynamic status update function (now uses 'active' boolean)
export async function updateActivityStatus(
  tenantId: string, 
  outletId: string, 
  status: boolean // true = billing/active, false = queue/inactive
) {
  if (!tenantId || !outletId) {
    throw new Error("Tenant ID and Outlet ID are required");
  }

  await updateDoc(
    doc(db, tenantId, outletId),
    {
      active: status,
      updatedAt: serverTimestamp()
    }
  );

  console.log(`✅ active status updated to: ${status} for ${outletId}`);
}

// Get current activity status from 'active' boolean field
export async function getActivityStatus(tenantId: string, outletId: string): Promise<boolean> {
  if (!tenantId || !outletId) {
    throw new Error("Tenant ID and Outlet ID are required");
  }

  const docRef = doc(db, tenantId, outletId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return data.active || false; // Default to false if not set
  }
  
  return false; // Default if document doesn't exist
}

// Check if billing should be shown based on 'active' field
export function shouldShowBilling(active: boolean): boolean {
  return active === true; // Show billing when active is true
}

// Helper functions for common cases
export const setBillingStatus = (tenantId: string, outletId: string) => 
  updateActivityStatus(tenantId, outletId, true);

export const setQueueStatus = (tenantId: string, outletId: string) => 
  updateActivityStatus(tenantId, outletId, false);