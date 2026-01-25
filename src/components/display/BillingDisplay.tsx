// src/components/display/BillingDisplay.tsx
"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firestore";
import { useAuth } from "@/hooks/useAuth";

// Interface matching your Firestore data structure
interface CustomerData {
  appointmentId: string | null;
  email: string;
  id: string;
  name: string;
  phone: string;
  points: number;
  profileImage: string | null;
  isEditMode: boolean;
}

interface Item {
  id: string;
  sessionId: string;
  itemType: "SERVICE" | "PRODUCT" | "CUSTOM";
  itemId: string;
  name: string;
  staffId: string | null;
  staffName: string | null;
  qty: number;
  unitPriceCents: number;
  tipCents: number;
  lineTotalCents: number;
  taxCents: number;
}

interface Summary {
  cash: string;
  debit: string;
  pointsGain: string;
  products: string;
  services: string;
  tax: string;
  total: string;
  usePoint: string;
}

interface Totals {
  appliedAmountCents: number;
  changeDueCents: number;
  dueCents: number;
  paidCents: number;
  tenderedCents: number;
  totalCents: number;
}

interface FirestoreData {
  active: boolean;
  customer: CustomerData;
  items: Item[];
  lastChangeCents: number;
  orderId: string | null;
  screen: string;
  signal: string;
  signalAt: any;
  status: string;
  summary: Summary;
  totals: Totals;
  updatedAt: any;
}

export default function BillingDisplay() {
  const [firestoreData, setFirestoreData] = useState<FirestoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { tenantId, outletId } = useAuth();

  useEffect(() => {
    if (!tenantId || !outletId) {
      setError("Authentication required. TenantId or OutletId missing.");
      setLoading(false);
      return;
    }

    console.log(`BillingDisplay: Loading data for ${tenantId}/${outletId}`);
    
    const docRef = doc(db, tenantId, outletId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as FirestoreData;
        console.log("Billing data received:", {
          customer: data.customer,
          itemsCount: data.items?.length || 0,
          totals: data.totals,
          active: data.active
        });
        setFirestoreData(data);
        setError(null);
      } else {
        console.log("No billing data found for this outlet");
        setFirestoreData(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error loading billing data:", err);
      setError("Failed to load billing data");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tenantId, outletId]);

  // Helper function to format cents to dollars
  const formatCentsToDollars = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Helper function to format string amounts to dollars
  const formatStringToDollars = (amount: string): string => {
    const num = parseFloat(amount);
    return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
  };

  // Format date from Firestore timestamp
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return new Date().toLocaleDateString();
    
    try {
      if (timestamp.toDate) {
        const date = timestamp.toDate();
        return date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        });
      }
      return new Date().toLocaleDateString();
    } catch (error) {
      return new Date().toLocaleDateString();
    }
  };

  // Format time from Firestore timestamp
  const formatTime = (timestamp: any): string => {
    if (!timestamp) return new Date().toLocaleTimeString();
    
    try {
      if (timestamp.toDate) {
        const date = timestamp.toDate();
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      return new Date().toLocaleTimeString();
    } catch (error) {
      return new Date().toLocaleTimeString();
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading billing data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  if (!firestoreData) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-gray-600 text-lg">No billing data available</div>
      </div>
    );
  }

  const { customer, items, totals, summary, updatedAt } = firestoreData;

  // Calculate totals from items if needed
  const itemsSubtotalCents = items?.reduce((sum, item) => sum + (item.lineTotalCents || 0), 0) || 0;
  
  // Use totals from Firestore or calculate
  const subTotalCents = totals?.totalCents || itemsSubtotalCents;
  const discountCents = totals?.appliedAmountCents || 0;
  const taxCents = summary ? parseFloat(summary.tax) * 100 : 0;
  const tipCents = items?.reduce((sum, item) => sum + (item.tipCents || 0), 0) || 0;
  const grandTotalCents = totals?.totalCents || subTotalCents;

  return (
    <div className="w-full h-full bg-white flex">
      {/* LEFT PANEL */}
      <div className="flex-1 p-8 border-r border-gray-200 overflow-hidden">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900">
            {customer?.name || "Guest Customer"}
          </h1>

          <div className="text-right text-gray-800">
            <div className="text-lg font-semibold">{formatDate(updatedAt)}</div>
            <div className="text-lg font-semibold">{formatTime(updatedAt)}</div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-base">
            <thead className="bg-gray-100">
              <tr className="text-gray-900">
                <th className="p-4 text-left font-bold w-16">No.</th>
                <th className="p-4 text-left font-bold">Item</th>
                <th className="p-4 text-center font-bold w-20">Qty</th>
                <th className="p-4 text-left font-bold w-40">Provider</th>
                <th className="p-4 text-right font-bold w-32">Amount</th>
              </tr>
            </thead>

            <tbody className="text-gray-900">
              {items && items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item.id || index} className="border-t border-gray-100">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4 font-semibold">{item.name}</td>
                    <td className="p-4 text-center">{item.qty || 1}</td>
                    <td className="p-4">{item.staffName || "Staff"}</td>
                    <td className="p-4 text-right font-semibold">
                      {formatCentsToDollars(item.lineTotalCents || 0)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No items in this order
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[420px] p-8 flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
            {items?.length || 0} {items?.length === 1 ? "Item" : "Items"}
          </h2>

          <div className="space-y-4 text-lg text-gray-900">
            <div className="flex justify-between">
              <span className="font-semibold">Sub Total</span>
              <span className="font-bold">{formatCentsToDollars(subTotalCents)}</span>
            </div>

            {discountCents > 0 && (
              <div className="flex justify-between">
                <span className="font-semibold">Discount</span>
                <span className="font-bold text-green-600">
                  -{formatCentsToDollars(discountCents)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="font-semibold">Taxes</span>
              <span className="font-bold">{formatCentsToDollars(taxCents)}</span>
            </div>

            {tipCents > 0 && (
              <div className="flex justify-between">
                <span className="font-semibold">Tip</span>
                <span className="font-bold">{formatCentsToDollars(tipCents)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-red-600 text-white rounded-3xl p-10 text-center shadow-lg">
          <p className="text-lg font-semibold tracking-wide">Grand Total</p>
          <p className="text-6xl font-extrabold mt-3">
            {formatCentsToDollars(grandTotalCents)}
          </p>
          
          
        </div>
      </div>
    </div>
  );
}