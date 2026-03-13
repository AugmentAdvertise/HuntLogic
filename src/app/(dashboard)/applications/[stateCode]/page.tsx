"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ExternalLink,
  Clock,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";

interface WorkflowStep {
  step: number;
  title: string;
  instructions: string;
  portalUrl?: string;
  requiredBefore: string[];
  estimatedMinutes: number;
  tips: string[];
}

export default function StateWalkthroughPage() {
  const params = useParams();
  const stateCode = (params.stateCode as string)?.toUpperCase();
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // Load completed steps from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`app-walkthrough-${stateCode}`);
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, [stateCode]);

  const fetchWorkflow = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/v1/applications/${stateCode}/workflow`
      );
      if (res.ok) {
        const data = await res.json();
        setSteps(data.steps ?? []);
        // Auto-expand first incomplete step
        const completed = JSON.parse(
          localStorage.getItem(`app-walkthrough-${stateCode}`) ?? "[]"
        );
        const firstIncomplete = (data.steps ?? []).find(
          (s: WorkflowStep) => !completed.includes(s.step)
        );
        if (firstIncomplete) setExpandedStep(firstIncomplete.step);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [stateCode]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  const toggleStep = (stepNum: number) => {
    const updated = completedSteps.includes(stepNum)
      ? completedSteps.filter((s) => s !== stepNum)
      : [...completedSteps, stepNum];
    setCompletedSteps(updated);
    localStorage.setItem(
      `app-walkthrough-${stateCode}`,
      JSON.stringify(updated)
    );
  };

  const progress =
    steps.length > 0
      ? Math.round((completedSteps.length / steps.length) * 100)
      : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 rounded-lg bg-brand-sage/10 motion-safe:animate-pulse dark:bg-brand-sage/20" />
        <div className="h-48 rounded-xl bg-brand-sage/10 motion-safe:animate-pulse dark:bg-brand-sage/20" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-brand-sage/10 motion-safe:animate-pulse dark:bg-brand-sage/20"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/applications"
        className="flex items-center gap-1 text-sm text-brand-sage hover:text-brand-forest"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-brand-sage/10 bg-white p-5 shadow-sm dark:border-brand-sage/20 dark:bg-brand-bark">
        <h1 className="text-xl font-bold text-brand-bark dark:text-brand-cream">
          {stateCode} Application Walkthrough
        </h1>
        <p className="mt-1 text-sm text-brand-sage">
          Step-by-step guide to completing your {stateCode} big game application
        </p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-brand-sage">
              {completedSteps.length} of {steps.length} steps complete
            </span>
            <span className="font-medium text-brand-forest dark:text-brand-cream">
              {progress}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-brand-sage/10 dark:bg-brand-sage/20">
            <div
              className="h-full rounded-full bg-gradient-cta transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Workflow Steps */}
      {steps.length === 0 ? (
        <div className="rounded-xl border border-brand-sage/10 bg-white p-8 text-center dark:border-brand-sage/20 dark:bg-brand-bark">
          <p className="text-sm text-brand-sage">
            No walkthrough available for {stateCode} yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.step);
            const isExpanded = expandedStep === step.step;

            return (
              <div
                key={step.step}
                className={cn(
                  "rounded-xl border bg-white shadow-sm transition-all dark:bg-brand-bark",
                  isCompleted
                    ? "border-green-200 dark:border-green-900/30"
                    : "border-brand-sage/10 dark:border-brand-sage/20"
                )}
              >
                {/* Step header */}
                <button
                  onClick={() =>
                    setExpandedStep(isExpanded ? null : step.step)
                  }
                  className="flex min-h-[44px] w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStep(step.step);
                    }}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-brand-sage/40" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-brand-sage">
                        Step {step.step}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-brand-sage/60">
                        <Clock className="h-2.5 w-2.5" />
                        {step.estimatedMinutes}m
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isCompleted
                          ? "text-brand-sage line-through"
                          : "text-brand-bark dark:text-brand-cream"
                      )}
                    >
                      {step.title}
                    </p>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-brand-sage" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-brand-sage" />
                  )}
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-brand-sage/10 px-4 py-3 dark:border-brand-sage/20">
                    <p className="text-sm text-brand-bark/80 dark:text-brand-cream/80 whitespace-pre-line">
                      {step.instructions}
                    </p>

                    {step.tips.length > 0 && (
                      <div className="mt-3 rounded-lg bg-amber-50 p-3 dark:bg-amber-900/10">
                        <div className="mb-1 flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                          <Lightbulb className="h-3.5 w-3.5" />
                          Pro Tips
                        </div>
                        <ul className="space-y-1">
                          {step.tips.map((tip, i) => (
                            <li
                              key={i}
                              className="text-xs text-amber-700/80 dark:text-amber-400/80"
                            >
                              &bull; {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.portalUrl && (
                      <a
                        href={step.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-[8px] bg-gradient-cta px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-md motion-safe:hover:-translate-y-0.5"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open {stateCode} Portal
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
