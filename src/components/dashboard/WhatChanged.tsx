"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Calendar, RefreshCw, X } from "lucide-react";

interface Change {
  id: string;
  type: "deadline_new" | "deadline_soon" | "point_creep" | "recommendation_new" | "strategy_update";
  title: string;
  description: string;
  actionUrl?: string;
  icon: "deadline" | "trend_up" | "trend_down" | "refresh";
}

export function WhatChanged() {
  const [changes, setChanges] = useState<Change[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchChanges = async () => {
      try {
        const res = await fetch("/api/v1/dashboard/changes");
        if (res.ok) {
          const data = await res.json();
          setChanges(data.changes ?? []);
        }
      } catch {
        // Silent fail
      }
    };
    fetchChanges();
  }, []);

  if (changes.length === 0 || dismissed) return null;

  const iconMap = {
    deadline: Calendar,
    trend_up: TrendingUp,
    trend_down: TrendingDown,
    refresh: RefreshCw,
  };

  return (
    <div className="rounded-xl border border-brand-sky/20 bg-brand-sky/5 p-4 dark:bg-brand-sky/10 dark:border-brand-sky/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-brand-bark dark:text-brand-cream">
          Since you were last here
        </h3>
        <button
          onClick={() => setDismissed(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-sage hover:bg-brand-sage/10"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2">
        {changes.slice(0, 5).map((change) => {
          const Icon = iconMap[change.icon] || RefreshCw;
          return (
            <div key={change.id} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
              <div>
                <p className="text-sm font-medium text-brand-bark dark:text-brand-cream">
                  {change.title}
                </p>
                <p className="text-xs text-brand-sage">{change.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
