"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DiagnosticsPage() {
  // Diagnostics section removed — keep a lightweight informational page
  return (
    <div className="min-h-screen p-8 lg:p-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Diagnostics Removed</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The diagnostics section has been removed from the admin dashboard to
          avoid exposing potentially sensitive information (e.g., emails).
        </p>
        <Link
          href="/admin"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
