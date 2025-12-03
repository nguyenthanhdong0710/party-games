"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, MessageCircle, Trophy } from "lucide-react";

interface HowToPlayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HowToPlayDialog({
  open,
  onOpenChange,
}: HowToPlayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            Cách chơi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Section 1: Role Distribution */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-base">Phân chia vai trò</h3>
                <p className="text-sm text-muted-foreground">
                  Mỗi người chơi nhận một vai trò bí mật:
                </p>
              </div>
            </div>
            <ul className="space-y-1 text-sm ml-2">
              <li>
                <span className="text-blue-500 font-semibold">• Người chơi:</span>{" "}
                Biết từ khóa bí mật.
              </li>
              <li>
                <span className="text-red-500 font-semibold">• Kẻ mạo danh:</span>{" "}
                Không biết từ khóa - phải giả vờ như biết.
              </li>
            </ul>
          </div>

          {/* Section 2: Questions & Answers */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-base">Giao lưu</h3>
                <p className="text-sm text-muted-foreground">
                  Lần lượt đưa ra gợi ý tinh tế về từ khóa.
                </p>
              </div>
            </div>
            <ul className="space-y-1 text-sm ml-2">
              <li>• Giữ gợi ý không quá mơ hồ nhưng cũng không quá rõ ràng.</li>
              <li>• Ví dụ từ khóa là &quot;Gà rán&quot;:</li>
              <ul className="ml-4 space-y-1">
                <li>• &quot;Màu Vàng&quot;</li>
                <li>• &quot;Bia&quot;</li>
                <li>• &quot;Tương ớt&quot;</li>
              </ul>
            </ul>
          </div>

          {/* Section 3: Final Move */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-base">Kết thúc</h3>
                <p className="text-sm text-muted-foreground">
                  Bất cứ lúc nào, người chơi có thể tố cáo ai đó là{" "}
                  <span className="text-red-500 font-semibold">Kẻ mạo danh</span>.
                </p>
              </div>
            </div>
            <ul className="space-y-1 text-sm ml-2">
              <li>
                • Nếu tìm đúng Kẻ mạo danh,{" "}
                <span className="text-blue-500 font-semibold">Người chơi thắng</span>.
              </li>
              <li>
                • Nếu Kẻ mạo danh đoán đúng từ khóa,{" "}
                <span className="text-red-500 font-semibold">Kẻ mạo danh thắng!</span>
              </li>
              <li>
                • Nếu hết thời gian,{" "}
                <span className="text-red-500 font-semibold">Kẻ mạo danh</span> phải
                đoán từ khóa để thắng.
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
