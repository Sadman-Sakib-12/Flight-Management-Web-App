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
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-7 animate-scale-in">
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            confirmVariant === "danger" ? "bg-red-50" : "bg-blue-50"
          }`}>
            <AlertTriangle className={`w-5 h-5 ${confirmVariant === "danger" ? "text-red-500" : "text-blue-500"}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{title}</h3>
            <p className="text-gray-500 mt-1.5 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
              confirmVariant === "danger"
                ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white"
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
