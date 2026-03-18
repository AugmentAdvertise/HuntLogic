"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarDays, TrendingUp, Target, DollarSign, Clock, AlertCircle } from "lucide-react";

interface PointStrategy {
  stateCode: string;
  stateName: string;
  speciesName: string;
  currentPoints: number;
  pointType: string;
  recommendation: string;
  rationale: string;
  annualCost: number;
  projectedYearsToTag: number | null;
}

interface Recommendation {
  hunt: {
    stateCode: string;
    stateName: string;
    speciesName: string;
    unitCode: string | null;
    timelineCategory: string;
    recType: string;
  };
  rationale: string;
  costEstimate: { total?: number };
  timelineEstimate: { earliest: string; expected: string; latest: string };
  confidence: { level: string; score: number };
}

interface PlaybookData {
  id: string;
  version: number;
  generatedAt: string;
  goalsSummary: string;
  executiveSummary: string;
  nearTerm: Recommendation[];
  midTerm: Recommendation[];
  longTerm: Recommendation[];
  pointStrategy: PointStrategy[];
  budgetAllocation: {
    totalBudget: number;
    allocations: { category: string; amount: number; description: string }[];
  };
  upcomingDeadlines: {
    state: string;
    species: string;
    deadlineType: string;
    date: string;
    actionRequired: string;
  }[];
}

export default function AnnualStrategyPage() {
  const [playbook, setPlaybook] = useState<PlaybookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaybook = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/playbook");
      if (!res.ok) throw new Error("Failed to fetch playbook");
      const data = await res.json();
      setPlaybook(data.playbook ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load strategy");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaybook();
  }, [fetchPlaybook]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!playbook) return <EmptyState />;

  const thisYear = playbook.nearTerm;
  const yearTwo = playbook.midTerm;
  const yearThreePlus = playbook.longTerm;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-forest dark:text-brand-cream">
          Annual Strategy
        </h1>
        <p className="mt-1 text-sm text-brand-sage">
          Your multi-year hunting strategy — v{playbook.version}, generated{" "}
          {new Date(playbook.generatedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Executive Summary */}
      <div className="rounded-xl border border-brand-sage/10 bg-white p-6 dark:bg-brand-bark dark:border-brand-sage/20">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-forest/10 dark:bg-brand-sage/20">
            <Target className="h-5 w-5 text-brand-forest dark:text-brand-sage" />
          </div>
          <h2 className="text-lg font-semibold text-brand-bark dark:text-brand-cream">
            Strategy Overview
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-brand-bark/80 dark:text-brand-cream/80">
          {playbook.executiveSummary}
        </p>
        {playbook.goalsSummary && (
          <p className="mt-3 text-sm italic text-brand-sage">
            {playbook.goalsSummary}
          </p>
        )}
      </div>

      {/* Timeline View */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-brand-bark dark:text-brand-cream">
          Hunt Timeline
        </h2>

        <TimelineSection
          title="This Year"
          subtitle="Apply now or take action this season"
          icon={<Clock className="h-5 w-5" />}
          recommendations={thisYear}
          accentColor="brand-forest"
        />

        <TimelineSection
          title="Year 2"
          subtitle="Build points and position for next season"
          icon={<TrendingUp className="h-5 w-5" />}
          recommendations={yearTwo}
          accentColor="brand-sage"
        />

        <TimelineSection
          title="Year 3+"
          subtitle="Long-term trophy and bucket-list hunts"
          icon={<CalendarDays className="h-5 w-5" />}
          recommendations={yearThreePlus}
          accentColor="brand-sunset"
        />
      </div>

      {/* Point Accumulation Trajectory */}
      {playbook.pointStrategy.length > 0 && (
        <div className="rounded-xl border border-brand-sage/10 bg-white p-6 dark:bg-brand-bark dark:border-brand-sage/20">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-forest/10 dark:bg-brand-sage/20">
              <TrendingUp className="h-5 w-5 text-brand-forest dark:text-brand-sage" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-brand-bark dark:text-brand-cream">
                Point Accumulation
              </h2>
              <p className="text-xs text-brand-sage">
                Recommended point strategy by state &amp; species
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {playbook.pointStrategy.map((ps, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-lg border border-brand-sage/10 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-brand-sage/20"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-bark dark:text-brand-cream">
                    {ps.stateName} — {ps.speciesName}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-sage">
                    {ps.currentPoints} {ps.pointType} pts •{" "}
                    <span className="capitalize">{ps.recommendation.replace(/_/g, " ")}</span>
                  </p>
                  <p className="mt-1 text-xs text-brand-bark/70 dark:text-brand-cream/60">
                    {ps.rationale}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-xs text-brand-sage">
                  {ps.projectedYearsToTag !== null && (
                    <span className="whitespace-nowrap">
                      ~{ps.projectedYearsToTag}yr to tag
                    </span>
                  )}
                  <span className="whitespace-nowrap">${ps.annualCost}/yr</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Overview */}
      {playbook.budgetAllocation && playbook.budgetAllocation.totalBudget > 0 && (
        <div className="rounded-xl border border-brand-sage/10 bg-white p-6 dark:bg-brand-bark dark:border-brand-sage/20">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-forest/10 dark:bg-brand-sage/20">
              <DollarSign className="h-5 w-5 text-brand-forest dark:text-brand-sage" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-brand-bark dark:text-brand-cream">
                Budget Allocation
              </h2>
              <p className="text-xs text-brand-sage">
                Estimated ${playbook.budgetAllocation.totalBudget.toLocaleString()} total
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {playbook.budgetAllocation.allocations.map((alloc, i) => (
              <div
                key={i}
                className="rounded-lg border border-brand-sage/10 p-3 dark:border-brand-sage/20"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize text-brand-bark dark:text-brand-cream">
                    {alloc.category.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm font-semibold text-brand-forest dark:text-brand-sage">
                    ${alloc.amount.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-brand-sage">{alloc.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Deadlines */}
      {playbook.upcomingDeadlines.length > 0 && (
        <div className="rounded-xl border border-brand-sage/10 bg-white p-6 dark:bg-brand-bark dark:border-brand-sage/20">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-sunset/10 dark:bg-brand-sunset/20">
              <AlertCircle className="h-5 w-5 text-brand-sunset" />
            </div>
            <h2 className="text-lg font-semibold text-brand-bark dark:text-brand-cream">
              Upcoming Deadlines
            </h2>
          </div>
          <div className="space-y-2">
            {playbook.upcomingDeadlines.map((dl, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 rounded-lg border border-brand-sage/10 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-brand-sage/20"
              >
                <div>
                  <p className="text-sm font-medium text-brand-bark dark:text-brand-cream">
                    {dl.state} — {dl.species}
                  </p>
                  <p className="text-xs text-brand-sage">
                    {dl.deadlineType} • {dl.actionRequired}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-brand-sunset">
                  {new Date(dl.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineSection({
  title,
  subtitle,
  icon,
  recommendations,
  accentColor,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  recommendations: Recommendation[];
  accentColor: string;
}) {
  if (recommendations.length === 0) {
    return (
      <div className="rounded-xl border border-brand-sage/10 bg-white p-6 dark:bg-brand-bark dark:border-brand-sage/20">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${accentColor}/10 text-${accentColor} dark:bg-${accentColor}/20`}>
            {icon}
          </div>
          <div>
            <h3 className="text-base font-semibold text-brand-bark dark:text-brand-cream">{title}</h3>
            <p className="text-xs text-brand-sage">{subtitle}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-brand-sage">No recommendations for this period yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand-sage/10 bg-white p-6 dark:bg-brand-bark dark:border-brand-sage/20">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${accentColor}/10 text-${accentColor} dark:bg-${accentColor}/20`}>
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-brand-bark dark:text-brand-cream">{title}</h3>
          <p className="text-xs text-brand-sage">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className="rounded-lg border border-brand-sage/10 p-4 dark:border-brand-sage/20"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-brand-bark dark:text-brand-cream">
                  {rec.hunt.stateName} — {rec.hunt.speciesName}
                  {rec.hunt.unitCode ? ` (Unit ${rec.hunt.unitCode})` : ""}
                </p>
                <span className="mt-1 inline-block rounded-full bg-brand-forest/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-forest dark:bg-brand-sage/20 dark:text-brand-sage">
                  {rec.hunt.recType.replace(/_/g, " ")}
                </span>
                <p className="mt-2 text-xs leading-relaxed text-brand-bark/70 dark:text-brand-cream/60">
                  {rec.rationale}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-brand-sage">
                <span>
                  {rec.timelineEstimate.earliest}–{rec.timelineEstimate.latest}
                </span>
                {rec.costEstimate.total != null && (
                  <span className="font-semibold text-brand-bark dark:text-brand-cream">
                    ~${rec.costEstimate.total.toLocaleString()}
                  </span>
                )}
                <span className="capitalize">
                  {Math.round(rec.confidence.score * 100)}% confidence
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 motion-safe:animate-pulse rounded-lg bg-brand-sage/10" />
        <div className="mt-2 h-4 w-72 motion-safe:animate-pulse rounded-lg bg-brand-sage/10" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-40 motion-safe:animate-pulse rounded-xl border border-brand-sage/10 bg-brand-sage/5"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-forest dark:text-brand-cream">
          Annual Strategy
        </h1>
        <p className="mt-1 text-sm text-brand-sage">
          Your multi-year hunting strategy
        </p>
      </div>
      <div className="flex flex-col items-center rounded-xl border border-brand-sage/10 bg-white px-6 py-16 text-center dark:bg-brand-bark dark:border-brand-sage/20">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-forest/10 dark:bg-brand-sage/20">
          <CalendarDays className="h-7 w-7 text-brand-forest dark:text-brand-sage" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-brand-bark dark:text-brand-cream">
          No Strategy Yet
        </h2>
        <p className="mt-2 max-w-sm text-sm text-brand-sage">
          Generate a playbook first to see your multi-year strategy. Head to the
          Playbook page and click &quot;Generate Playbook&quot; to get started.
        </p>
        <a
          href="/playbook"
          className="mt-6 inline-flex items-center gap-2 rounded-[8px] bg-gradient-cta px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md"
        >
          Go to Playbook
        </a>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-forest dark:text-brand-cream">
          Annual Strategy
        </h1>
      </div>
      <div className="flex flex-col items-center rounded-xl border border-red-200 bg-white px-6 py-12 text-center dark:bg-brand-bark dark:border-red-800">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{message}</p>
      </div>
    </div>
  );
}
