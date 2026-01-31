"use client";

import React, { useEffect, useMemo, useState } from "react";
import SignaturePad from "./SignaturePad";
import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  type FirestoreError,
} from "firebase/firestore";
import { db } from "@/app/firestore";
import { useAuth } from "@/hooks/useAuth";

export type EnforcementValue = "DRAW_SIGNATURE" | "TYPED_NAME" | "CHECKBOX_ONLY";

type ConsentResponseStatus = "CONFIRMED" | "CANCELED";

type ConsentSubmitPayload = {
  tenantId?: string;
  outletId?: string;
  staffId?: string;
  appointmentId?: string;
  customerId?: string;
  serviceId?: string;
  formId?: string;
  concentFormId?: string;
  enforcement: EnforcementValue;
  signatureType?: "TYPED_NAME" | "CHECKBOX_ONLY" | "SIGNATURE_IMAGE";
  heading: string;
  consent: string;
  typedName?: string;
  accepted?: boolean; 
  isChecked?: boolean;
  signatureDataUrl?: string; 
  imageUrl?: string;
  emailMe?: boolean;
  channel?: string;
  submittedAt: string;
};

type ConsentRequest = {
  channelId: string;
  status: "IDLE" | "PENDING";

  tenantId: string;
  outletId: string;
  staffId?: string;

  appointmentId?: string;
  customerId?: string;
  channel?: string;

  serviceId: string;
  serviceName?: string;

  formId: string;
  heading: string;
  consent: string;
  enforcement: EnforcementValue;
};

const DEFAULT_HEADING = "Consent";
const DEFAULT_CONSENT =
  "I confirm that I have read and understood the details of the service being provided.\n\nBy proceeding, I provide my consent to receive the service.";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isEnforcement(v: any): v is EnforcementValue {
  return v === "TYPED_NAME" || v === "CHECKBOX_ONLY" || v === "DRAW_SIGNATURE";
}

function makeChannelId(tenantId: string, outletId: string) {
  return `${tenantId}_${outletId}_any`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripUndefinedDeep = (val: any): any => {
  if (val === undefined) return undefined;

  if (Array.isArray(val)) {
    return val.map(stripUndefinedDeep).filter((x) => x !== undefined);
  }

  if (val && typeof val === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: any = {};
    Object.keys(val).forEach((k) => {
      const v = stripUndefinedDeep(val[k]);
      if (v !== undefined) out[k] = v;
    });
    return out;
  }

  return val;
};

export default function ConsentPage() {
  const { tenantId, outletId } = useAuth();

  const channelId = useMemo(() => {
    if (!tenantId || !outletId) return "";
    return makeChannelId(String(tenantId), String(outletId));
  }, [tenantId, outletId]);

  const [req, setReq] = useState<ConsentRequest | null>(null);
  const [fsError, setFsError] = useState("");

  useEffect(() => {
    if (!channelId) return;

    const ref = doc(db, "pos_consent_requests", channelId);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        setFsError("");

        if (!snap.exists()) {
          setReq(null);
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = snap.data();

        if (data?.status !== "PENDING") {
          setReq(null);
          return;
        }

        const enforcement: EnforcementValue = isEnforcement(data?.enforcement)
          ? data.enforcement
          : "TYPED_NAME";

        setReq({
          channelId,
          status: "PENDING",
          tenantId: String(data?.tenantId || ""),
          outletId: String(data?.outletId || ""),
          staffId: data?.staffId ? String(data.staffId) : undefined,

          appointmentId: data?.appointmentId ? String(data.appointmentId) : undefined,
          customerId: data?.customerId ? String(data.customerId) : undefined,
          channel: data?.channel ? String(data.channel) : undefined,

          serviceId: String(data?.serviceId || ""),
          serviceName: data?.serviceName ? String(data.serviceName) : "",
          formId: String(data?.formId || ""),
          heading: String(data?.heading || DEFAULT_HEADING),
          consent: String(data?.consent || DEFAULT_CONSENT),
          enforcement,
        });
      },
      (err: FirestoreError) => {
        console.error("❌ Consent request listen failed:", err);
        setFsError(err.message || "Failed to listen consent request");
        setReq(null);
      }
    );

    return () => unsub();
  }, [channelId]);

  const enforcement = useMemo<EnforcementValue>(
    () => req?.enforcement || "TYPED_NAME",
    [req]
  );
  const heading = useMemo(() => req?.heading || DEFAULT_HEADING, [req]);
  const consent = useMemo(() => req?.consent || DEFAULT_CONSENT, [req]);
  const serviceId = useMemo(() => req?.serviceId || "", [req]);
  const formId = useMemo(() => req?.formId || "", [req]);

  const [typedName, setTypedName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState<string>("");
  const [emailMe, setEmailMe] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setTypedName("");
    setAccepted(false);
    setSignature("");
    setEmailMe(false);
    setSubmitting(false);
    setSubmitted(false);
    setErrorMsg("");
  }, [enforcement, heading, consent, serviceId, formId]);

  const canConfirm = useMemo(() => {
    if (!req) return false;
    if (submitted) return false;
    if (enforcement === "TYPED_NAME") return typedName.trim().length > 0;
    if (enforcement === "CHECKBOX_ONLY") return accepted;
    if (enforcement === "DRAW_SIGNATURE") return Boolean(signature);
    return false;
  }, [req, enforcement, typedName, accepted, signature, submitted]);

  const payload: ConsentSubmitPayload = useMemo(() => {
    const base: ConsentSubmitPayload = {
      tenantId: req?.tenantId || String(tenantId || ""),
      outletId: req?.outletId || String(outletId || ""),
      staffId: req?.staffId,

      appointmentId: req?.appointmentId,
      customerId: req?.customerId,

      serviceId: serviceId || undefined,

      formId: formId || undefined,
      concentFormId: formId || undefined,

      enforcement,
      heading: heading || DEFAULT_HEADING,
      consent: consent || DEFAULT_CONSENT,

      channel: req?.channel || "POS",

      submittedAt: new Date().toISOString(),
    };

    if (enforcement === "TYPED_NAME") {
      base.signatureType = "TYPED_NAME";
      base.typedName = typedName.trim() || undefined;
    }

    if (enforcement === "CHECKBOX_ONLY") {
      base.signatureType = "CHECKBOX_ONLY";
      base.accepted = accepted;
      base.isChecked = accepted; 
    }

    if (enforcement === "DRAW_SIGNATURE") {
      base.signatureType = "SIGNATURE_IMAGE";
      base.signatureDataUrl = signature || undefined; 
      base.imageUrl = signature || undefined;
      base.emailMe = emailMe;
    }

    return stripUndefinedDeep(base);
  }, [
    req,
    tenantId,
    outletId,
    serviceId,
    formId,
    enforcement,
    heading,
    consent,
    typedName,
    accepted,
    signature,
    emailMe,
  ]);

  const writeResponse = async (
    status: ConsentResponseStatus,
    data?: ConsentSubmitPayload
  ) => {
    if (!channelId) return;

    const respRef = doc(db, "pos_consent_responses", channelId);

    const safe = stripUndefinedDeep({
      channelId,
      status,
      ...(data || {}),
      serverSubmittedAt: serverTimestamp(),
    });

    await setDoc(respRef, safe, { merge: true });

    await setDoc(
      doc(db, "pos_consent_requests", channelId),
      { status: "IDLE", updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  const onConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      await writeResponse("CONFIRMED", payload);
      setSubmitted(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = async () => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      await writeResponse("CANCELED", {
        tenantId: req?.tenantId || String(tenantId || ""),
        outletId: req?.outletId || String(outletId || ""),
        staffId: req?.staffId,

        appointmentId: req?.appointmentId,
        customerId: req?.customerId,

        serviceId: serviceId || undefined,
        formId: formId || undefined,
        concentFormId: formId || undefined,

        enforcement,
        signatureType:
          enforcement === "DRAW_SIGNATURE"
            ? "SIGNATURE_IMAGE"
            : enforcement === "CHECKBOX_ONLY"
              ? "CHECKBOX_ONLY"
              : "TYPED_NAME",

        heading: heading || DEFAULT_HEADING,
        consent: consent || DEFAULT_CONSENT,

        accepted: enforcement === "CHECKBOX_ONLY" ? accepted : undefined,
        isChecked: enforcement === "CHECKBOX_ONLY" ? accepted : undefined,

        signatureDataUrl: enforcement === "DRAW_SIGNATURE" ? signature || undefined : undefined,
        imageUrl: enforcement === "DRAW_SIGNATURE" ? signature || undefined : undefined,
        emailMe: enforcement === "DRAW_SIGNATURE" ? emailMe : undefined,

        channel: req?.channel || "POS",

        submittedAt: new Date().toISOString(),
      });

      setSubmitted(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErrorMsg(e?.message || "Cancel failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!tenantId || !outletId) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-2xl bg-[#EEEEEE] p-6 text-center">
          <h1 className="text-lg font-bold text-neutral-900">Auth missing</h1>
          <p className="mt-2 text-sm text-neutral-600">
            tenantId/outletId not available from token.
          </p>
        </div>
      </div>
    );
  }

  if (fsError) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-2xl bg-red-50 border border-red-200 p-6 text-center">
          <h1 className="text-lg font-bold text-red-700">Firestore error</h1>
          <p className="mt-2 text-sm text-red-700">{fsError}</p>
          <p className="mt-2 text-xs text-neutral-600">channelId: {channelId}</p>
        </div>
      </div>
    );
  }

  if (!req) {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center p-6">
        <div className="max-w-xl w-full rounded-2xl bg-[#EEEEEE] p-6 text-center">
          <h1 className="text-lg font-bold text-neutral-900">
            Waiting for consent…
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            POS screen will send a consent request when a service requires it.
          </p>
          <p className="mt-3 text-xs text-neutral-500">
            Listening doc: pos_consent_requests/{channelId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-[28px] bg-[#EEEEEE] p-5 sm:p-6 shadow-sm">
        <div className="text-center mb-4">
          <h1 className="text-lg sm:text-xl font-bold text-neutral-900">
            {heading}
          </h1>

          {req?.serviceName ? (
            <div className="mt-1 text-sm text-neutral-600">
              Service: <span className="font-semibold">{req.serviceName}</span>
            </div>
          ) : null}
        </div>

        <div className="rounded-[18px] border border-neutral-200 bg-white p-4 sm:p-5 max-h-[360px] overflow-y-auto whitespace-pre-line text-[13px] leading-6 text-neutral-700">
          {consent}
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
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
                    <div className="md:col-span-1">
                      <label className="block text-sm font-semibold text-neutral-800 mb-2">
                        Sign Here
                      </label>
                      <SignaturePad height={120} onChangeDataUrl={setSignature} />
                    </div>

                    <div className="md:col-span-1 flex md:justify-center">
                      <label className="inline-flex items-center gap-3 select-none">
                        <input
                          type="checkbox"
                          checked={emailMe}
                          onChange={(e) => setEmailMe(e.target.checked)}
                          className="h-4 w-4 accent-[#D7263D]"
                        />
                        <span className="text-sm text-neutral-800">Email me</span>
                      </label>
                    </div>

                    <div className="hidden md:block md:col-span-1" />
                  </div>
                </div>
              )}
            </div>

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
        </div>
      </div>
    </div>
  );
}
