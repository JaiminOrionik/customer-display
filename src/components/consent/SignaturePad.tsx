"use client";

import React, { useEffect, useRef } from "react";

type SignaturePadProps = {
  height?: number;
  onChangeDataUrl?: (dataUrl: string) => void;
};

type AnyPointerEvent = MouseEvent | TouchEvent;

function isTouchEvent(e: AnyPointerEvent): e is TouchEvent {
  return "touches" in e;
}

export default function SignaturePad({ height = 120, onChangeDataUrl }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  const resizeToDevice = () => {
    const c = canvasRef.current;
    if (!c) return;

    const parent = c.parentElement;
    const cssW = parent ? parent.clientWidth : 420;
    const dpr = window.devicePixelRatio || 1;

    // set internal pixel buffer
    c.width = Math.floor(cssW * dpr);
    c.height = Math.floor(height * dpr);

    // set css size
    c.style.width = "100%";
    c.style.height = `${height}px`;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    // draw in CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  useEffect(() => {
    resizeToDevice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  useEffect(() => {
    const onResize = () => resizeToDevice();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPos = (e: AnyPointerEvent) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };

    const rect = c.getBoundingClientRect();

    const clientX = isTouchEvent(e)
      ? (e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX ?? 0)
      : e.clientX;

    const clientY = isTouchEvent(e)
      ? (e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY ?? 0)
      : e.clientY;

    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const start = (e: AnyPointerEvent) => {
    drawingRef.current = true;
    lastRef.current = getPos(e);
  };

  const move = (e: AnyPointerEvent) => {
    if (!drawingRef.current) return;

    const c = canvasRef.current;
    if (!c) return;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    const pos = getPos(e);
    const last = lastRef.current;

    if (!last) {
      lastRef.current = pos;
      return;
    }

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastRef.current = pos;
    onChangeDataUrl?.(c.toDataURL("image/png"));
  };

  const end = () => {
    drawingRef.current = false;
    lastRef.current = null;
  };

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);

    resizeToDevice();
    onChangeDataUrl?.("");
  };

  return (
    <div className="w-full">
      <div className="rounded-xl border border-neutral-300 bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => start(e.nativeEvent)}
          onMouseMove={(e) => move(e.nativeEvent)}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={(e) => start(e.nativeEvent)}
          onTouchMove={(e) => move(e.nativeEvent)}
          onTouchEnd={end}
          style={{ display: "block", touchAction: "none" }}
        />
      </div>

      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={clear}
          className="h-8 px-3 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
