import { Hammer, PlusCircle, Receipt, User } from "lucide-react";

export type WorkerTabType =
  | "profile"
  | "record_work"
  | "ledger"
  | "aalyawale_brick_logs";

interface WorkerDetailTabsProps {
  activeTab: WorkerTabType;
  onSelectTab: (tab: WorkerTabType) => void;
  canWrite: boolean;
  logCount?: number;
  hideRecordWork?: boolean;
  workerCategory?: string | null;
}

export function WorkerDetailTabs({
  activeTab,
  onSelectTab,
  canWrite,
  logCount = 0,
  hideRecordWork = false,
  workerCategory,
}: WorkerDetailTabsProps) {
  const isAalyawale = workerCategory === "AALYAWALE";

  return (
    <div className="flex border-b border-border bg-card rounded-t-lg px-2 pt-2 gap-1 overflow-x-auto">
      <button
        onClick={() => onSelectTab("profile")}
        className={`px-4 cursor-pointer py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
          activeTab === "profile"
            ? "border-primary text-primary bg-primary/5 rounded-t-md"
            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-t-md"
        }`}
      >
        <User className="h-4 w-4" /> View Profile Details / प्रोफाइल माहिती
      </button>

      {canWrite && !hideRecordWork && (
        <button
          onClick={() => onSelectTab("record_work")}
          className={`px-4 cursor-pointer py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === "record_work"
              ? "border-amber-500 text-amber-500 bg-amber-500/5 rounded-t-md"
              : "border-transparent text-muted-foreground hover:text-amber-500 hover:bg-amber-500/5 rounded-t-md"
          }`}
        >
          <PlusCircle className="h-4 w-4 text-amber-500" /> Record Daily Work /
          काम नोंदवा
        </button>
      )}

      {isAalyawale && (
        <button
          onClick={() => onSelectTab("aalyawale_brick_logs")}
          className={`px-4 cursor-pointer py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
            activeTab === "aalyawale_brick_logs"
              ? "border-amber-500 text-amber-500 bg-amber-500/5 rounded-t-md"
              : "border-transparent text-muted-foreground hover:text-amber-500 hover:bg-amber-500/5 rounded-t-md"
          }`}
        >
          <Hammer className="h-4 w-4 text-amber-500" /> Daily Brick Build Log /
          आल्यावाले वीट नोंद
        </button>
      )}

      <button
        onClick={() => onSelectTab("ledger")}
        className={`px-4 py-2.5 cursor-pointer text-xs font-bold transition-all border-b-2 flex items-center gap-2 shrink-0 ${
          activeTab === "ledger"
            ? "border-emerald-500 text-emerald-500 bg-emerald-500/5 rounded-t-md"
            : "border-transparent text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5 rounded-t-md"
        }`}
      >
        <Receipt className="h-4 w-4 text-emerald-500" /> Work Logs / कामाची
        नोंदवही
        {logCount > 0 && (
          <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono font-semibold rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            {logCount}
          </span>
        )}
      </button>
    </div>
  );
}
