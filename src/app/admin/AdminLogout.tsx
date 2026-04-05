"use client";

import { useRouter } from "next/navigation";

export default function AdminLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
    >
      ログアウト
    </button>
  );
}
