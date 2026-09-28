"use client";

import React from "react";
import { LayoutDashboard, ShoppingCart, Flame } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export type MaterialTabType = "overview" | "purchases" | "consumption";

interface MaterialDetailTabsProps {
  activeTab: MaterialTabType;
  onSelectTab: (tab: MaterialTabType) => void;
  purchaseCount?: number;
  consumptionCount?: number;
}

export function MaterialDetailTabs({
  activeTab,
  onSelectTab,
  purchaseCount = 0,
  consumptionCount = 0,
}: MaterialDetailTabsProps) {
  const tabs = [
    {
      id: "overview" as const,
      label: "Overview & Stock",
      icon: LayoutDashboard,
      count: undefined,
    },
    {
      id: "purchases" as const,
      label: "Purchase History / खरेदी नोंद",
      icon: ShoppingCart,
      count: purchaseCount,
    },
    {
      id: "consumption" as const,
      label: "Usage Logs / इंधन/माल वापर नोंद",
      icon: Flame,
      count: consumptionCount,
    },
  ];

  return (
    <div className="border-b border-border bg-card rounded-t-xl px-2 pt-2 flex gap-1 overflow-x-auto shadow-xs">
      <TabsList className="bg-transparent p-0 gap-1 h-auto flex flex-nowrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-bold transition-all border-b-2 rounded-t-lg rounded-b-none shrink-0 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "border-primary text-primary bg-primary/10"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded-full ${
                    isActive
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
}
