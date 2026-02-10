"use client";

import React, { useMemo } from "react";

type Row = {
  consentId: string;
  formTitle: string;
  services: string;
  signedAt: string; // ISO
  outlet: string;
  version: string;
  channel: "Online" | "In-store";
  status: "valid" | "expired";
};

export default function ConsentHistoryStatic() {
  const rows: Row[] = useMemo(
    () => [
      {
        consentId: "CN-001345",
        formTitle: "Hair Cutting Consent",
        services: "Hair Cut",
        signedAt: "2023-06-15T10:30:00Z",
        outlet: "Outlet A",
        version: "1.0",
        channel: "Online",
        status: "valid",
      },
      {
        consentId: "CN-001346",
        formTitle: "Hair Coloring Consent",
        services: "Hair Coloring",
        signedAt: "2023-07-02T14:00:00Z",
        outlet: "Outlet B",
        version: "1.1",
        channel: "In-store",
        status: "valid",
      },
      {
        consentId: "CN-001347",
        formTitle: "Skin Care Consent",
        services: "Facial",
        signedAt: "2023-07-10T09:15:00Z",
        outlet: "Outlet C",
        version: "2.0",
        channel: "Online",
        status: "valid",
      },
      {
        consentId: "CN-001348",
        formTitle: "Body Massage Consent",
        services: "Full Body Massage",
        signedAt: "2023-08-01T18:45:00Z",
        outlet: "Outlet D",
        version: "1.0",
        channel: "In-store",
        status: "expired",
      },
      {
        consentId: "CN-001349",
        formTitle: "Hair Spa Consent",
        services: "Hair Spa",
        signedAt: "2023-08-12T11:20:00Z",
        outlet: "Outlet A",
        version: "1.2",
        channel: "Online",
        status: "valid",
      },
    ],
    [],
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    // screenshot style similar: YYYY-MM-DDTHH:mm:ssZ
    return d.toISOString().replace(".000Z", "Z");
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-6xl rounded-[22px] bg-white  overflow-hidden">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-neutral-900">Consent Forms</h2>
        </div>

        <div className="px-4 pb-6">
          <div className="rounded-[18px] border border-rose-200 overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-rose-100 text-neutral-900">
                  <th className="py-3 px-4 text-left text-xs font-semibold">No.</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold">Consent ID</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold">Form Title</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold">Services</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold">Signed Date</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold">Outlet</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold">Version</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold">Channel</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.consentId} className="border-t border-rose-100">
                    <td className="py-4 px-4 text-sm text-neutral-800">{idx + 1}.</td>
                    <td className="py-4 px-4 text-sm font-semibold text-neutral-900">
                      {r.consentId}
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-neutral-900">
                      {r.formTitle}
                    </td>
                    <td className="py-4 px-4 text-sm text-neutral-800">{r.services}</td>
                    <td className="py-4 px-4 text-xs text-neutral-700">
                      {formatDate(r.signedAt)}
                    </td>
                    <td className="py-4 px-4 text-sm text-neutral-900">{r.outlet}</td>
                    <td className="py-4 px-4 text-sm text-neutral-900">{r.version}</td>
                    <td className="py-4 px-4 text-sm text-neutral-900">{r.channel}</td>
                    <td className="py-4 px-4 text-sm text-neutral-900">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                          r.status === "expired"
                            ? "bg-neutral-200 text-neutral-800"
                            : "bg-emerald-100 text-emerald-800",
                        ].join(" ")}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {/* View */}
                        <button
                          type="button"
                          className="h-8 w-8 rounded-full border border-rose-200 hover:bg-rose-50 flex items-center justify-center"
                          title="View"
                          onClick={() => alert(`View: ${r.consentId}`)}
                        >
                          👁️
                        </button>

                        {/* Download */}
                        <button
                          type="button"
                          className="h-8 w-8 rounded-full border border-rose-200 hover:bg-rose-50 flex items-center justify-center"
                          title="Download"
                          onClick={() => alert(`Download: ${r.consentId}`)}
                        >
                          ⬇️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-xs text-neutral-500">
            Static mode (no Firestore/API) — just for UI testing.
          </div>
        </div>
      </div>
    </div>
  );
}
