"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  stateCode: string | null;
  stateName: string | null;
  speciesName: string | null;
  year: number;
  result: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  not_started: { label: "Not Started", color: "text-brand-sage", icon: Clock },
  in_progress: {
    label: "In Progress",
    color: "text-amber-600 dark:text-amber-400",
    icon: AlertCircle,
  },
  submitted: {
    label: "Submitted",
    color: "text-blue-600 dark:text-blue-400",
    icon: CheckCircle2,
  },
  drawn: {
    label: "Drawn",
    color: "text-green-600 dark:text-green-400",
    icon: CheckCircle2,
  },
  unsuccessful: {
    label: "Unsuccessful",
    color: "text-red-500 dark:text-red-400",
    icon: AlertCircle,
  },
};

const STATES_WITH_WORKFLOWS = ["CO", "WY", "MT", "AZ", "NM"];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "completed">("all");

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications ?? []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const filtered = applications.filter((app) => {
    if (filter === "open")
      return ["not_started", "in_progress"].includes(app.result ?? "");
    if (filter === "completed")
      return ["submitted", "drawn", "unsuccessful"].includes(app.result ?? "");
    return true;
  });

  // Group by state
  const grouped = STATES_WITH_WORKFLOWS.map((code) => ({
    code,
    apps: filtered.filter((a) => a.stateCode === code),
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 rounded-lg bg-brand-sage/10 motion-safe:animate-pulse dark:bg-brand-sage/20" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-brand-sage/10 motion-safe:animate-pulse dark:bg-brand-sage/20"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-bark dark:text-brand-cream">
          Application Season
        </h1>
        <p className="mt-1 text-sm text-brand-sage">
          Track and manage your western big game applications
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "open", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "min-h-[44px] rounded-[8px] px-4 py-2 text-sm font-medium transition-colors",
              filter === f
                ? "bg-brand-forest text-white"
                : "border border-brand-sage/20 text-brand-sage hover:bg-brand-sage/5 dark:border-brand-sage/30"
            )}
          >
            {f === "all" ? "All States" : f === "open" ? "Open Now" : "Completed"}
          </button>
        ))}
      </div>

      {/* State Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {grouped.map(({ code, apps }) => {
          const latestApp = apps[0];
          const status = latestApp?.result ?? "not_started";
          const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_started;
          const StatusIcon = config.icon;

          return (
            <Link
              key={code}
              href={`/applications/${code}`}
              className="rounded-xl border border-brand-sage/10 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-brand-sage/20 dark:bg-brand-bark motion-safe:hover:-translate-y-0.5"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-forest/10 dark:bg-brand-sage/20">
                    <ClipboardList className="h-5 w-5 text-brand-forest dark:text-brand-cream" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-brand-bark dark:text-brand-cream">
                      {code}
                    </h3>
                    <p className="text-xs text-brand-sage">
                      {latestApp?.speciesName ?? "Start Application"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-brand-sage/50" />
              </div>

              <div className="flex items-center justify-between">
                <div className={cn("flex items-center gap-1.5 text-xs font-medium", config.color)}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {config.label}
                </div>
                <div className="flex items-center gap-1 text-xs text-brand-sage">
                  <Calendar className="h-3 w-3" />
                  {latestApp ? latestApp.year : new Date().getFullYear()}
                </div>
              </div>

              {apps.length > 1 && (
                <p className="mt-2 text-[10px] text-brand-sage">
                  +{apps.length - 1} more application{apps.length > 2 ? "s" : ""}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {applications.length === 0 && (
        <div className="rounded-xl border border-brand-sage/10 bg-white p-8 text-center dark:border-brand-sage/20 dark:bg-brand-bark">
          <ClipboardList className="mx-auto h-10 w-10 text-brand-sage/30" />
          <p className="mt-3 text-sm text-brand-sage">
            No applications tracked yet. Select a state above to start the
            guided walkthrough.
          </p>
        </div>
      )}
    </div>
  );
}
