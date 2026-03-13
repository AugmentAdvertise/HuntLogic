"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { MapPin, DollarSign, Calendar } from "lucide-react";

interface ItineraryItem {
  day: number;
  activity: string;
  cost: number;
}

interface CostBreakdown {
  travel: number;
  lodging: number;
  food: number;
  tags: number;
  total: number;
}

interface TripPlanData {
  totalDays: number;
  itinerary: ItineraryItem[];
  costBreakdown: CostBreakdown;
  summary: string;
}

interface TripPlanProps {
  recommendationId?: string;
  huntState?: string;
}

const costColors: Record<string, string> = {
  travel: "bg-blue-500",
  lodging: "bg-amber-500",
  food: "bg-green-500",
  tags: "bg-brand-sunset",
};

export function TripPlan({ recommendationId, huntState }: TripPlanProps) {
  const [plan, setPlan] = useState<TripPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (recommendationId) params.set("recommendationId", recommendationId);
      else if (huntState) params.set("state", huntState);

      const res = await fetch(`/api/v1/travel?${params}`);
      if (res.ok) {
        setPlan(await res.json());
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [recommendationId, huntState]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-brand-sage/10 motion-safe:animate-pulse dark:bg-brand-sage/20"
          />
        ))}
      </div>
    );
  }

  if (!plan) {
    return (
      <p className="text-sm text-brand-sage">Unable to load trip plan.</p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl border border-brand-sage/10 bg-white p-4 dark:border-brand-sage/20 dark:bg-brand-bark">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-forest/10 dark:bg-brand-sage/20">
            <MapPin className="h-5 w-5 text-brand-forest dark:text-brand-sage" />
          </div>
          <div>
            <p className="text-sm font-semibold text-brand-bark dark:text-brand-cream">
              {plan.summary}
            </p>
            <p className="text-xs text-brand-sage">
              {plan.totalDays} days total
            </p>
          </div>
        </div>
      </div>

      {/* Itinerary */}
      <div className="rounded-xl border border-brand-sage/10 bg-white p-4 dark:border-brand-sage/20 dark:bg-brand-bark">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-bark dark:text-brand-cream">
          <Calendar className="h-4 w-4" />
          Day-by-Day Itinerary
        </h4>

        <div className="relative space-y-0">
          {plan.itinerary.map((item, idx) => (
            <div key={idx} className="flex gap-3 pb-3">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-forest text-[10px] font-bold text-white dark:bg-brand-sage">
                  {item.day}
                </div>
                {idx < plan.itinerary.length - 1 && (
                  <div className="mt-1 w-px flex-1 bg-brand-sage/20" />
                )}
              </div>
              <div className="flex-1 pb-1">
                <p className="text-sm text-brand-bark dark:text-brand-cream">
                  {item.activity}
                </p>
                {item.cost > 0 && (
                  <p className="text-xs text-brand-sage">
                    ~${item.cost}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="rounded-xl border border-brand-sage/10 bg-white p-4 dark:border-brand-sage/20 dark:bg-brand-bark">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-bark dark:text-brand-cream">
          <DollarSign className="h-4 w-4" />
          Cost Breakdown
        </h4>

        {/* Stacked bar */}
        <div className="mb-3 flex h-4 overflow-hidden rounded-full">
          {Object.entries(plan.costBreakdown)
            .filter(([key]) => key !== "total")
            .map(([key, val]) => {
              const pct =
                plan.costBreakdown.total > 0
                  ? (val / plan.costBreakdown.total) * 100
                  : 0;
              return (
                <div
                  key={key}
                  className={cn("h-full transition-all", costColors[key] ?? "bg-gray-400")}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
        </div>

        {/* Legend */}
        <div className="space-y-1.5">
          {(
            [
              ["travel", "Travel"],
              ["lodging", "Lodging"],
              ["food", "Food"],
              ["tags", "Tags & License"],
            ] as const
          ).map(([key, label]) => (
            <div
              key={key}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    costColors[key]
                  )}
                />
                <span className="text-xs text-brand-sage">{label}</span>
              </div>
              <span className="text-xs font-medium text-brand-bark dark:text-brand-cream">
                ${plan.costBreakdown[key].toLocaleString()}
              </span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-brand-sage/10 pt-2 dark:border-brand-sage/20">
            <span className="text-sm font-semibold text-brand-bark dark:text-brand-cream">
              Total
            </span>
            <span className="text-sm font-bold text-brand-forest dark:text-brand-cream">
              ${plan.costBreakdown.total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
