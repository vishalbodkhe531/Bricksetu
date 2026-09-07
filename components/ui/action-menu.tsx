"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "default" | "destructive";
}

interface ActionMenuProps {
  items: ActionMenuItem[];
}

export function ActionMenu({ items }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  }>({
    right: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const right = document.documentElement.clientWidth - rect.right;
      const spaceBelow = window.innerHeight - rect.bottom;
      const estimatedMenuHeight = items.length * 38 + 16;

      // If space below is limited, open UPWARDS above the action button
      if (spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight) {
        const bottom = window.innerHeight - rect.top + 4;
        setCoords({ bottom, right });
      } else {
        const top = rect.bottom + 4;
        setCoords({ top, right });
      }
    }
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest(".action-portal-menu")
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 hover:bg-muted rounded-md"
        onClick={toggleMenu}
        title="Actions"
      >
        <MoreVertical className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      </Button>

      {isOpen &&
        mounted &&
        createPortal(
          <div
            className="action-portal-menu fixed z-[9999] min-w-36 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in-80 zoom-in-95"
            style={{
              ...(coords.bottom !== undefined
                ? { bottom: `${coords.bottom}px` }
                : { top: `${coords.top}px` }),
              right: `${coords.right}px`,
            }}
          >
            {items.map((item, idx) => {
              const className = `flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                item.variant === "destructive"
                  ? "text-destructive hover:bg-destructive/15"
                  : "text-foreground hover:bg-primary/10 hover:text-primary"
              }`;

              if (item.href) {
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={className}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    item.onClick?.();
                  }}
                  className={className}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
