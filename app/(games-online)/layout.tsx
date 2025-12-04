"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import DisplayNameDialog from "@/components/DisplayNameDialog";
import { ArrowLeft, Pencil } from "lucide-react";
import { PlayerProvider, usePlayer } from "@/providers/player-provider";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { displayName, setDisplayName } = usePlayer();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Edit Dialog */}
      <DisplayNameDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={setDisplayName}
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

export default function GameLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PlayerProvider>
      <LayoutContent>{children}</LayoutContent>
    </PlayerProvider>
  );
}
