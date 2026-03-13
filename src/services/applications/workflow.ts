import { db } from "@/lib/db";
import { appConfig } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export interface WorkflowStep {
  step: number;
  title: string;
  instructions: string;
  portalUrl?: string;
  requiredBefore: string[];
  estimatedMinutes: number;
  tips: string[];
}

/**
 * Load workflow steps for a given state from app_config
 */
export async function loadWorkflow(
  stateCode: string
): Promise<WorkflowStep[]> {
  const row = await db
    .select()
    .from(appConfig)
    .where(
      and(
        eq(appConfig.namespace, "applications"),
        eq(appConfig.key, `workflow.${stateCode}`)
      )
    )
    .limit(1);

  if (row.length === 0) return [];

  const steps = row[0].value as WorkflowStep[];
  return steps.sort((a, b) => a.step - b.step);
}

/**
 * Get all available state workflows
 */
export async function getAvailableWorkflows(): Promise<string[]> {
  const rows = await db
    .select({ key: appConfig.key })
    .from(appConfig)
    .where(eq(appConfig.namespace, "applications"));

  return rows
    .map((r) => r.key)
    .filter((k) => k.startsWith("workflow."))
    .map((k) => k.replace("workflow.", ""));
}
