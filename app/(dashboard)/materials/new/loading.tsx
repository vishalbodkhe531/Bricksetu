import { Clock } from "lucide-react";

export default function LoadingNewMaterial() {
  return (
    <div className="flex h-48 items-center justify-center">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Clock className="h-4 w-4 animate-spin text-primary" /> Loading material registration form...
      </div>
    </div>
  );
}
