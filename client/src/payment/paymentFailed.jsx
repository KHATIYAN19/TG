import React from "react";
import {
  AlertCircle,
  ArrowLeft,
  Mail,
  RefreshCw,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("order");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-9">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
          <AlertCircle size={30} className="text-red-600" />
        </div>

        <h1 className="mt-5 text-2xl font-black text-slate-950 sm:text-3xl">
          Payment wasn't completed
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
          We could not confirm your payment. You can return to the
          book and try again.
        </p>

        {orderId && (
          <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-400">Order ID</p>

            <p className="mt-1 break-all text-sm font-bold text-slate-700">
              {orderId}
            </p>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
          <p className="text-sm font-bold text-amber-900">
            Was money deducted?
          </p>

          <p className="mt-1 text-xs leading-5 text-amber-800">
            Please do not immediately make another payment. Contact
            us with your order ID so we can verify the transaction.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/books"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to Books
          </Link>

          <a
            href="mailto:supporttargettrek@gmail.com"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <Mail size={16} />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}