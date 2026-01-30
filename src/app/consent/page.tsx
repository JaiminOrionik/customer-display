"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import SignaturePad from "./SignaturePad";

export type EnforcementValue =
  | "DRAW_SIGNATURE"
  | "TYPED_NAME"
  | "CHECKBOX_ONLY";

type ConsentSubmitPayload = {
  serviceId?: string;
  formId?: string;
  enforcement: EnforcementValue;
  heading: string;
  consent: string;
  typedName?: string;
  accepted?: boolean;
  signatureDataUrl?: string;
  emailMe?: boolean;
  submittedAt: string;
};

const DEFAULT_HEADING = "Consent Form Title";
const DEFAULT_CONSENT =
  "I confirm that I have read and understood the details of the service being provided.\n\nBy proceeding, I provide my consent to receive the service.";

function safeParam(sp: URLSearchParams, key: string, fallback = "") {
  const v = sp.get(key);
  return (v ?? fallback).toString();
}

function isEnforcement(v: string | null): v is EnforcementValue {
  return v === "TYPED_NAME" || v === "CHECKBOX_ONLY" || v === "DRAW_SIGNATURE";
}

export default function ConsentPage() {
  const searchParams = useSearchParams();

  const enforcement = useMemo<EnforcementValue>(() => {
    const raw = searchParams.get("enforcement");
    if (isEnforcement(raw)) return raw;
    return "TYPED_NAME";
  }, [searchParams]);

  const heading = useMemo(
    () => safeParam(searchParams, "heading", DEFAULT_HEADING),
    [searchParams],
  );

  const consent = useMemo(
    () => safeParam(searchParams, "consent", DEFAULT_CONSENT),
    [searchParams],
  );

  const serviceId = useMemo(
    () => safeParam(searchParams, "serviceId", ""),
    [searchParams],
  );
  const formId = useMemo(
    () => safeParam(searchParams, "formId", ""),
    [searchParams],
  );

  const [typedName, setTypedName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState<string>("");
  const [emailMe, setEmailMe] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Reset on enforcement or content change (same behavior as your modal)
  useEffect(() => {
    setTypedName("");
    setAccepted(false);
    setSignature("");
    setEmailMe(false);
    setSubmitting(false);
    setSubmitted(false);
    setErrorMsg("");
  }, [enforcement, heading, consent]);

  const canConfirm = useMemo(() => {
    if (submitted) return false;
    if (enforcement === "TYPED_NAME") return typedName.trim().length > 0;
    if (enforcement === "CHECKBOX_ONLY") return accepted;
    if (enforcement === "DRAW_SIGNATURE") return Boolean(signature);
    return false;
  }, [enforcement, typedName, accepted, signature, submitted]);

  const payload: ConsentSubmitPayload = useMemo(
    () => ({
      serviceId: serviceId || undefined,
      formId: formId || undefined,
      enforcement,
      heading: heading || DEFAULT_HEADING,
      consent: consent || DEFAULT_CONSENT,
      typedName: typedName.trim() || undefined,
      accepted,
      signatureDataUrl: signature || undefined,
      emailMe,
      submittedAt: new Date().toISOString(),
    }),
    [
      serviceId,
      formId,
      enforcement,
      heading,
      consent,
      typedName,
      accepted,
      signature,
      emailMe,
    ],
  );

  const notifyStaffScreen = (data: ConsentSubmitPayload) => {
    // staff/admin display can listen to window message
    try {
      window.postMessage({ type: "CONSENT_SUBMITTED", payload: data }, "*");
    } catch {}
  };

  const submitToApi = async (data: ConsentSubmitPayload) => {
    // Optional API call
    const res = await fetch("/api/consent/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(t || "Failed to submit consent");
    }
  };

  const onConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      notifyStaffScreen(payload);
      await submitToApi(payload);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = () => {
    try {
      window.postMessage(
        {
          type: "CONSENT_CANCELLED",
          payload: {
            serviceId: serviceId || undefined,
            formId: formId || undefined,
            enforcement,
            submittedAt: new Date().toISOString(),
          },
        },
        "*",
      );
    } catch {}

    // clear inputs
    setTypedName("");
    setAccepted(false);
    setSignature("");
    setEmailMe(false);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
      {/* Grey Outer Container (Figma style) */}
      <div className="w-full max-w-5xl rounded-[28px] bg-[#EEEEEE] p-5 sm:p-6 shadow-sm">
        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-lg sm:text-xl font-bold text-neutral-900">
            {heading || DEFAULT_HEADING}
          </h1>
        </div>

        {/* White Scroll Consent Box */}
        <div className="rounded-[18px] border border-neutral-200 bg-white p-4 sm:p-5 max-h-[360px] overflow-y-auto whitespace-pre-line text-[13px] leading-6 text-neutral-700">
          {consent || DEFAULT_CONSENT}
        </div>

        {/* Bottom Area */}
        <div className="mt-5 flex flex-col gap-4">
          {/* INPUT ROW (left) + BUTTONS (right) */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            {/* LEFT AREA (changes per enforcement) */}
            <div className="flex-1">
              {enforcement === "TYPED_NAME" && (
                <div className="max-w-md">
                  <label className="block text-sm font-semibold text-neutral-800 mb-2">
                    Type Your Name
                  </label>
                  <input
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm outline-none focus:ring-2 focus:ring-neutral-200 bg-white text-gray-700"
                  />
                </div>
              )}

              {enforcement === "CHECKBOX_ONLY" && (
                <label className="inline-flex items-center gap-3 select-none">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="h-4 w-4 accent-[#D7263D]"
                  />
                  <span className="text-sm text-neutral-800">
                    I accept the terms and conditions
                  </span>
                </label>
              )}

              {enforcement === "DRAW_SIGNATURE" && (
                <div className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {/* Signature */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-semibold text-neutral-800 mb-2">
                        Sign Here
                      </label>
                      <SignaturePad
                        height={120}
                        onChangeDataUrl={(d) => setSignature(d)}
                      />
                    </div>

                    {/* Email me (center) */}
                    <div className="md:col-span-1 flex md:justify-center">
                      <label className="inline-flex items-center gap-3 select-none">
                        <input
                          type="checkbox"
                          checked={emailMe}
                          onChange={(e) => setEmailMe(e.target.checked)}
                          className="h-4 w-4 accent-[#D7263D]"
                        />
                        <span className="text-sm text-neutral-800">
                          Email me
                        </span>
                      </label>
                    </div>

                    {/* Spacer */}
                    <div className="hidden md:block md:col-span-1" />
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Buttons (bottom-right like figma) */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onConfirm}
                disabled={!canConfirm || submitting}
                className={[
                  "h-9 px-6 rounded-full text-sm font-semibold text-white",
                  !canConfirm || submitting
                    ? "bg-[#D7263D]/60 cursor-not-allowed"
                    : "bg-[#D7263D] hover:brightness-95",
                ].join(" ")}
              >
                {submitting ? "Submitting..." : "Confirm"}
              </button>

              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="h-9 px-6 rounded-full text-sm font-semibold border border-[#D7263D] text-[#D7263D] bg-transparent hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Error / Success line (optional) */}
          {errorMsg ? (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              {errorMsg}
            </div>
          ) : null}

          {submitted ? (
            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
              Consent submitted successfully.
            </div>
          ) : null}

          {/* Optional debug */}
          {(serviceId || formId) && (
            <div className="text-xs text-neutral-500">
              {serviceId ? <span>serviceId: {serviceId}</span> : null}
              {serviceId && formId ? <span className="mx-2">•</span> : null}
              {formId ? <span>formId: {formId}</span> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
