// components/LogoutWrapper.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function LogoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if token exists on mount
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
      if (!token) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <>
      <LogoutButton />
      {children}
    </>
  );
}