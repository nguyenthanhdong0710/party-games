"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { DEFAULT_DISPLAY_NAME, DISPLAY_NAME_MAX_LENGTH } from "@/lib/constants";
import { usePlayer } from "@/providers/player-provider";

interface DisplayNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (name: string) => void;
  initialValue?: string;
  allowClose?: boolean;
}

export default function DisplayNameDialog({
  open,
  onOpenChange,
  onSave,
  initialValue,
  allowClose = true,
}: DisplayNameDialogProps) {
  const { displayName, setDisplayName } = usePlayer();
  const [tempName, setTempName] = useState("");

  // Set initial value when dialog opens
  useEffect(() => {
    if (open) {
      setTempName(initialValue || displayName || "");
    }
  }, [open, initialValue, displayName]);

  const handleSave = () => {
    const trimmedName = tempName.trim();
    if (trimmedName) {
      setDisplayName(trimmedName);
      onSave?.(trimmedName);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (allowClose) {
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !allowClose) {
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm" showCloseButton={allowClose}>
        <DialogHeader>
          <DialogTitle>
            {allowClose ? "Chỉnh sửa tên hiển thị" : "Nhập tên hiển thị"}
          </DialogTitle>
          {!allowClose && (
            <DialogDescription>
              Vui lòng nhập tên để tiếp tục
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="displayName">Tên hiển thị</Label>
          <Input
            id="displayName"
            type="text"
            placeholder={DEFAULT_DISPLAY_NAME}
            value={tempName}
            onChange={(e) => {
              if (e.target.value.length <= DISPLAY_NAME_MAX_LENGTH) {
                setTempName(e.target.value);
              }
            }}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && tempName.trim()) {
                handleSave();
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            Nhập tối đa {DISPLAY_NAME_MAX_LENGTH} ký tự ({tempName.length}/
            {DISPLAY_NAME_MAX_LENGTH})
          </p>
        </div>

        <DialogFooter className="gap-2">
          {allowClose && (
            <Button variant="outline" onClick={handleCancel}>
              Hủy
            </Button>
          )}
          <Button onClick={handleSave} disabled={!tempName.trim()}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
