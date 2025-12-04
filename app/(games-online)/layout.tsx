"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import DisplayNameDialog from "@/components/DisplayNameDialog";
import { ArrowLeft, Pencil } from "lucide-react";
import { DISPLAY_NAME_KEY, DEFAULT_DISPLAY_NAME } from "@/lib/constants";

export default function GameLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(DEFAULT_DISPLAY_NAME);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Load display name from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem(DISPLAY_NAME_KEY);
    if (savedName) {
      setDisplayName(savedName);
    }
  }, []);

  const handleOpenEditDialog = () => {
    setIsEditDialogOpen(true);
  };

  const handleSave = (name: string) => {
    setDisplayName(name);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-3 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Display Name */}
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium truncate max-w-32">
            {displayName}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleOpenEditDialog}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Edit Dialog */}
      <DisplayNameDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
        initialValue={displayName}
        allowClose={true}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 pt-3 pb-10">
        {children}
      </main>
    </div>
  );
}
