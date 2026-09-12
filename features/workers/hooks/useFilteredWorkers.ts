import { useMemo } from "react";
import type { Worker } from "@/features/workers/types/worker.types";

export function useFilteredWorkers(workers: Worker[], activeTab: string) {
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      ALL: workers.length,
      AALYAWALE: 0,
      BHATKAR: 0,
      KACHA_MAAL: 0,
      PAKKA_MAAL: 0,
    };
    for (const w of workers) {
      const cat = w.category;
      if (cat && cat in c) {
        c[cat] += 1;
      }
    }
    return c;
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    if (activeTab === "ALL") return workers;
    return workers.filter((w) => w.category === activeTab);
  }, [workers, activeTab]);

  return { counts, filteredWorkers };
}
