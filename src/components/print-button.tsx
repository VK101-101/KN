"use client";

export function PrintButton({ label = "Print / save PDF" }: { label?: string }) {
  return (
    <button type="button" className="btn btn-primary text-sm" onClick={() => window.print()}>
      {label}
    </button>
  );
}
