"use client";

import { useEffect, useMemo, useState } from "react";
import {
  doc,
  onSnapshot,
  Timestamp,
  type FirestoreError,
} from "firebase/firestore";
import { db } from "@/app/firestore";
import { useAuth } from "@/hooks/useAuth";

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
  discountCents: number;
}

type FsTimestamp = Timestamp | null | undefined;

interface FirestoreData {
  active: boolean;
  customer: CustomerData;
  items: Item[];
  lastChangeCents: number;
  orderId: string | null;
  screen: string;
  signal: string;
  signalAt: FsTimestamp;
  status: string;
  summary: Summary;
  totals: Totals;
  updatedAt: FsTimestamp;
}

export default function BillingDisplay() {
  const [firestoreData, setFirestoreData] = useState<FirestoreData | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const { tenantId, outletId } = useAuth();

  const authMissing = !tenantId || !outletId;
  const authError = authMissing
    ? "Authentication required. TenantId or OutletId missing."
    : null;

  useEffect(() => {
    if (!tenantId || !outletId) return;

    console.log(`BillingDisplay: Loading data for ${tenantId}/${outletId}`);

    const docRef = doc(db, tenantId, outletId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as FirestoreData;
          console.log("Billing data received:", {
            customer: data.customer,
            itemsCount: data.items?.length || 0,
            totals: data.totals,
            active: data.active,
          });
          setFirestoreData(data);
          setError(null);
        } else {
          console.log("No billing data found for this outlet");
          setFirestoreData(null);
        }

        setHasLoadedOnce(true);
      },
      (err: FirestoreError) => {
        console.error("Error loading billing data:", err);
        setError("Failed to load billing data");
        setHasLoadedOnce(true);
      },
    );

    return () => unsubscribe();
  }, [tenantId, outletId]);

  const loading = !authMissing && !hasLoadedOnce;

  const formatCentsToDollars = (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const customerName = useMemo(() => {
    const name = firestoreData?.customer?.name?.trim();
    return name && name.length > 0 ? name : "Guest";
  }, [firestoreData?.customer?.name]);

  const customerSub = useMemo(() => {
    const email = firestoreData?.customer?.email?.trim();
    const phone = firestoreData?.customer?.phone?.trim();
    return email || phone || "No contact";
  }, [firestoreData?.customer?.email, firestoreData?.customer?.phone]);

  const computed = useMemo(() => {
    const items = firestoreData?.items || [];
    const totals = firestoreData?.totals;
    const summary = firestoreData?.summary;

    const itemsSubtotalCents =
      items.reduce((sum, it) => sum + (it.lineTotalCents || 0), 0) || 0;

    const subTotalCents = totals?.totalCents || itemsSubtotalCents;
    const discountCents = totals?.discountCents || 0;

    const taxCents = summary ? parseFloat(summary.tax) * 100 : 0;

    const tipCents =
      items.reduce((sum, it) => sum + (it.tipCents || 0), 0) || 0;

    const grandTotalCents = totals?.totalCents || subTotalCents;

    return {
      items,
      itemsCount: items.length,
      subTotalCents,
      discountCents,
      taxCents,
      tipCents,
      grandTotalCents,
      updatedAt: firestoreData?.updatedAt,
    };
  }, [firestoreData]);

  /* ===================== DYNAMIC TOP CARD (same logic as POS) ===================== */
  const payView = useMemo(() => {
    const totals = firestoreData?.totals;

    const totalCents =
      typeof totals?.totalCents === "number"
        ? totals.totalCents
        : computed.grandTotalCents || 0;

    const paidCents =
      typeof totals?.paidCents === "number" ? totals.paidCents : 0;

    const dueCents =
      typeof totals?.dueCents === "number"
        ? Math.max(0, totals.dueCents)
        : Math.max(0, totalCents - paidCents);

    const changeFromTotals = Math.max(0, paidCents - totalCents);

    const changeCents =
      (typeof totals?.changeDueCents === "number" && totals.changeDueCents > 0
        ? totals.changeDueCents
        : typeof firestoreData?.lastChangeCents === "number" &&
            firestoreData.lastChangeCents > 0
          ? firestoreData.lastChangeCents
          : 0) || changeFromTotals;

    const hasAnyPayment = paidCents > 0 || changeFromTotals > 0;

    const topTitle = !hasAnyPayment
      ? "Grand Total"
      : changeCents > 0
        ? "Change Due"
        : dueCents > 0
          ? "Amount Due"
          : "Grand Total";

    const topAmount = !hasAnyPayment
      ? formatCentsToDollars(totalCents)
      : changeCents > 0
        ? formatCentsToDollars(changeCents)
        : dueCents > 0
          ? formatCentsToDollars(dueCents)
          : formatCentsToDollars(totalCents);

    const bottomTitle = hasAnyPayment ? "Grand Total :" : "Checkout";
    const bottomAmount = hasAnyPayment ? formatCentsToDollars(totalCents) : "";

    return {
      totalCents,
      paidCents,
      dueCents,
      changeCents,
      hasAnyPayment,
      topTitle,
      topAmount,
      bottomTitle,
      bottomAmount,
    };
  }, [firestoreData, computed.grandTotalCents]);

  // ------- early returns AFTER hooks -------
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading billing data...</div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600 text-lg">{authError}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  if (!firestoreData) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 text-lg">No billing data available</div>
      </div>
    );
  }

  return (
    <div className="w-full flex">
      {/* LEFT PANEL */}
      <div className="flex-1 md:p-6 ">
        {/* Header row */}
        <div className="flex items-start pb-4">
          <div className="min-w-0">
            <div className="text-2xl font-semibold text-gray-900 truncate">
              {customerName}
            </div>
            <div
              className="mt-1 text-sm text-gray-600 truncate "
              title={customerSub}
            >
              {customerSub}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Table */}
          <div className="w-full lg:basis-3/4 min-w-0">
            <div className="mt-4 rounded-md border border-gray-200 overflow-hidden ">
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="px-4 py-3 text-left font-semibold w-16">
                        No.
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Item
                      </th>
                      <th className="px-4 py-3 text-center font-semibold w-28">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left font-semibold w-40">
                        Provider
                      </th>
                      <th className="px-4 py-3 text-right font-semibold w-32">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody className="text-gray-900">
                    {computed.items.length > 0 ? (
                      computed.items.map((item, index) => (
                        <tr
                          key={item.id || index}
                          className="border-t border-gray-200"
                        >
                          <td className="px-4 py-3">{index + 1}.</td>

                          <td className="px-4 py-3">
                            <div className="font-medium">{item.name}</div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            {item.qty || 1}
                          </td>

                          <td className="px-4 py-3">
                            {item.staffName || "Staff"}
                          </td>

                          <td className="px-4 py-3 text-right font-medium">
                            {formatCentsToDollars(item.lineTotalCents || 0)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center">
                          <div className="text-gray-500">
                            No items in session
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="hidden lg:block border-r border-gray-200 mx-6" />

          {/* RIGHT PANEL */}
          <div className="lg:basis-1/4 min-w-70 py-6">
            <div className="h-full flex flex-col md:flex-row lg:flex-col gap-9 justify-between items-center">
              {/* Items count */}
              <div className="flex flex-col items-center lg:pt-2">
                <div className="text-3xl font-normal text-rose-700 leading-none">
                  {computed.itemsCount}
                </div>
                <div className="text-xl  font-semibold text-gray-900 mt-1">
                  Items
                </div>
              </div>

              {/* Breakdown */}
              <div className="lg:mt-6 space-y-2 text-base text-gray-900 min-w-72 px-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Sub Total :</span>
                  <span className="font-semibold">
                    {formatCentsToDollars(computed.subTotalCents)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold">Discount :</span>
                  <span className="font-semibold">
                    {computed.discountCents > 0
                      ? `${formatCentsToDollars(computed.discountCents)}`
                      : "$0.00"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold">Taxes :</span>
                  <span className="font-semibold">
                    {formatCentsToDollars(computed.taxCents)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold flex items-center gap-1">
                    Tip <span className="text-gray-500">ⓘ</span>
                  </span>
                  <span className="font-semibold">
                    {formatCentsToDollars(computed.tipCents)}
                  </span>
                </div>
              </div>

              {/* DYNAMIC CARD: Grand Total / Amount Due / Change Due */}
              <div className="lg:mt-6 bg-rose-700 text-white rounded-2xl px-6 py-6 text-center shadow-md min-w-60">
                <div className="text-base font-semibold opacity-95">
                  {payView.topTitle}
                </div>

                <div className="mt-2 text-4xl font-semibold tracking-tight">
                  {payView.topAmount}
                </div>

                <div className="mt-2 text-base font-semibold opacity-90">
                  {payView.bottomTitle}
                  {payView.bottomAmount ? ` ${payView.bottomAmount}` : ""}
                </div>
              </div>

              {/* <div className="h-1" /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
