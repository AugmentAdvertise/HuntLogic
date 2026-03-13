// =============================================================================
// Travel Config Seed Data
// Run: npx tsx src/lib/db/seeds/travel-config.ts
// =============================================================================

import { db } from "@/lib/db";
import { appConfig } from "@/lib/db/schema";

const configs = [
  {
    namespace: "travel",
    key: "flight_tiers",
    description: "Flight cost estimation by distance tier",
    value: [
      { maxMiles: 500, cost: 200 },
      { maxMiles: 1000, cost: 350 },
      { maxMiles: 1500, cost: 450 },
      { maxMiles: 99999, cost: 550 },
    ],
  },
  {
    namespace: "travel",
    key: "lodging",
    description: "Lodging cost per night by style",
    value: {
      camp: 15,
      budget: 100,
      mid: 150,
    },
  },
  {
    namespace: "travel",
    key: "fuel",
    description: "Fuel cost parameters",
    value: {
      avgPrice: 3.5,
      avgMpg: 20,
    },
  },
  {
    namespace: "travel",
    key: "food",
    description: "Daily food cost estimate",
    value: {
      dailyEstimate: 40,
    },
  },
];

export async function seedTravelConfig() {
  console.log("[seed] Seeding travel config...");

  for (const config of configs) {
    await db
      .insert(appConfig)
      .values(config)
      .onConflictDoUpdate({
        target: [appConfig.namespace, appConfig.key],
        set: {
          value: config.value,
          description: config.description,
          updatedAt: new Date(),
        },
      });
  }

  console.log(`[seed] Seeded ${configs.length} travel config entries`);
}
