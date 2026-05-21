"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title, message, confirmLabel = "Confirm",
  confirmVariant = "primary", loading = false,
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-card-lg max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            confirmVariant === "danger" ? "bg-red-50" : "bg-blue-50"
          }`}>
            <AlertTriangle className={`w-5 h-5 ${confirmVariant === "danger" ? "text-red-500" : "text-blue-500"}`} />
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 mb-1">{title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 font-semibold py-2.5 px-5 rounded-xl text-sm transition-all duration-150 disabled:opacity-50 ${
              confirmVariant === "danger"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "btn-primary"
            }`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
