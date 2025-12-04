"use client";

import { ReactNode } from "react";
import AuthGuard from "@/guards/AuthGuard";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <AuthGuard>{children}</AuthGuard>;
}
