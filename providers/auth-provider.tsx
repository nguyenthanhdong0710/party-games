"use client";

import { ReactNode } from "react";
import AuthGuard from "@/components/AuthGuard";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <AuthGuard>{children}</AuthGuard>;
}
