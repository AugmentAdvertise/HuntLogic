import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { config } from "@/lib/config";

interface ServiceCheck {
  status: "healthy" | "unhealthy" | "not_configured";
  latencyMs?: number;
  error?: string;
}

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  checks: {
    database: ServiceCheck;
    redis: ServiceCheck;
    meilisearch: ServiceCheck;
  };
}

export async function GET() {
  const health: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.1.0",
    checks: {
      database: { status: "unhealthy" },
      redis: { status: "unhealthy" },
      meilisearch: { status: "not_configured" },
    },
  };

  // Check PostgreSQL
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    health.checks.database = {
      status: "healthy",
      latencyMs: Date.now() - dbStart,
    };
  } catch (error) {
    health.checks.database = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Check Redis — use ioredis so auth is handled automatically via the URL
  try {
    const redisUrl = config.redis.url;
    if (!redisUrl) {
      health.checks.redis = { status: "not_configured" };
    } else {
      const redisStart = Date.now();
      const { default: Redis } = await import("ioredis");
      const client = new Redis(redisUrl, {
        connectTimeout: 3000,
        commandTimeout: 2000,
        maxRetriesPerRequest: 0,
        lazyConnect: true,
        enableOfflineQueue: false,
      });

      await client.connect();
      await client.ping();
      await client.quit();

      health.checks.redis = {
        status: "healthy",
        latencyMs: Date.now() - redisStart,
      };
    }
  } catch (error) {
    health.checks.redis = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // Meilisearch — not configured, skip
  health.checks.meilisearch = { status: "not_configured" };

  // Determine overall status
  const checkStatuses = Object.values(health.checks);
  const realChecks = checkStatuses.filter((c) => c.status !== "not_configured");
  const allHealthy = realChecks.every((c) => c.status === "healthy");
  const allUnhealthy = realChecks.every((c) => c.status === "unhealthy");

  if (allUnhealthy && realChecks.length > 0) {
    health.status = "unhealthy";
  } else if (!allHealthy) {
    health.status = "degraded";
  } else {
    health.status = "healthy";
  }

  const statusCode = health.status === "unhealthy" ? 503 : 200;
  return NextResponse.json(health, { status: statusCode });
}
