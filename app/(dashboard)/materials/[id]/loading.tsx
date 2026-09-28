import { Clock } from "lucide-react";

export default function LoadingMaterialDetail() {
  return (
    <div className="flex h-48 items-center justify-center">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Clock className="h-4 w-4 animate-spin text-primary" /> Loading material details...
      </div>
    </div>
  );
}
