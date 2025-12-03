"use client";

import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useCheckAuth, useLogin } from "@/hooks/useApi";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const { data: authData, isLoading: isCheckingAuth } = useCheckAuth();
  const loginMutation = useLogin();

  // Update authentication state when authData changes
  useEffect(() => {
    if (authData !== undefined) {
      setIsAuthenticated(authData.authenticated);
    }
  }, [authData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    loginMutation.mutate(password, {
      onSuccess: (data) => {
        if (data.success) {
          setIsAuthenticated(true);
          setPassword("");
        } else {
          setError(data.message || "Mật khẩu không đúng");
        }
      },
      onError: () => {
        setError("Có lỗi xảy ra, vui lòng thử lại");
      },
    });
  };

  // Loading state
  if (isCheckingAuth || isAuthenticated === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">
          Đang kiểm tra...
        </div>
      </div>
    );
  }

  // Not authenticated - show password form
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm space-y-6 p-6 rounded-xl border bg-card">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Xác thực</h2>
            <p className="text-muted-foreground text-sm">
              Nhập mật khẩu để truy cập hệ thống
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending || !password.trim()}
            >
              {loginMutation.isPending ? "Đang xác thực..." : "Xác nhận"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated - render children
  return <>{children}</>;
}
