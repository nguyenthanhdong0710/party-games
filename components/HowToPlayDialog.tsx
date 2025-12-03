"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
              <div className="w-10 h-10 bg-red-500 rounded shrink-0" />
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
              <div className="w-10 h-10 bg-red-500 rounded shrink-0" />
              <div>
                <h3 className="font-bold text-base">Hỏi & Đáp</h3>
                <p className="text-sm text-muted-foreground">
                  Lần lượt đặt câu hỏi tinh tế về từ khóa.
                </p>
              </div>
            </div>
            <ul className="space-y-1 text-sm ml-2">
              <li>• Giữ câu hỏi mơ hồ, không quá rõ ràng.</li>
              <li>• Ví dụ:</li>
              <ul className="ml-4 space-y-1">
                <li>• &quot;Nóng hay lạnh?&quot;</li>
                <li>• &quot;Đông đúc hay yên tĩnh?&quot;</li>
                <li>• &quot;Dùng ở nhà hay ngoài trời?&quot;</li>
              </ul>
            </ul>
          </div>

          {/* Section 3: Final Move */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500 rounded shrink-0" />
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
