// =============================================================================
// Trip Planner — Generate full trip itineraries from recommendations
// =============================================================================

import {
  estimateDistanceMiles,
  estimateDriveHours,
  estimateFlightCost,
  estimateFuelCost,
  estimateLodgingCost,
  loadTravelConfig,
} from "./index";

// =============================================================================
// Types
// =============================================================================

export interface TripPlan {
  totalDays: number;
  itinerary: { day: number; activity: string; cost: number }[];
  costBreakdown: {
    travel: number;
    lodging: number;
    food: number;
    tags: number;
    total: number;
  };
  summary: string;
}

interface TripInput {
  homeState: string;
  huntState: string;
  huntDays?: number;
  tagCost?: number;
  lodgingStyle?: "camp" | "budget" | "mid";
}

// =============================================================================
// generateTripPlan
// =============================================================================

export async function generateTripPlan(input: TripInput): Promise<TripPlan> {
  const config = await loadTravelConfig();
  const distance = estimateDistanceMiles(input.homeState, input.huntState);
  const driveHours = estimateDriveHours(input.homeState, input.huntState);
  const huntDays = input.huntDays ?? 5;
  const lodgingStyle = input.lodgingStyle ?? "budget";
  const tagCost = input.tagCost ?? 500;

  // Determine travel mode
  const willFly = driveHours > 12;
  const travelDays = willFly ? 1 : driveHours > 6 ? 2 : 1;

  const totalDays = travelDays + huntDays + travelDays; // travel + hunt + return

  // Calculate costs
  const travelCost = willFly
    ? estimateFlightCost(distance, config) * 2 // round trip flights
    : estimateFuelCost(distance, config);

  const totalNights = totalDays - 1;
  const lodgingCost = estimateLodgingCost(totalNights, lodgingStyle, config);
  const foodCost = config.food.dailyEstimate * totalDays;

  // Build itinerary
  const itinerary: { day: number; activity: string; cost: number }[] = [];
  let day = 1;

  // Travel to hunt
  if (travelDays >= 2) {
    itinerary.push({
      day: day++,
      activity: willFly
        ? `Fly to ${input.huntState} and settle in`
        : `Drive to ${input.huntState} (${Math.round(driveHours / 2)}h, overnight stop)`,
      cost: Math.round(travelCost / 2),
    });
    itinerary.push({
      day: day++,
      activity: `Arrive at hunt area, set up camp/check in, evening scout`,
      cost: Math.round(travelCost / 2),
    });
  } else {
    itinerary.push({
      day: day++,
      activity: willFly
        ? `Fly to ${input.huntState}, pick up rental, drive to hunt area`
        : `Drive to ${input.huntState} (${Math.round(driveHours)}h), afternoon scout`,
      cost: travelCost,
    });
  }

  // Hunt days
  for (let h = 0; h < huntDays; h++) {
    const isFirst = h === 0;
    const isLast = h === huntDays - 1;
    itinerary.push({
      day: day++,
      activity: isFirst
        ? "First hunt day — execute primary plan, glass and move"
        : isLast
          ? "Final hunt day — last chance push, pack up if successful"
          : `Hunt day ${h + 1} — adjust strategy based on conditions`,
      cost: Math.round(foodCost / totalDays),
    });
  }

  // Return travel
  if (travelDays >= 2) {
    itinerary.push({
      day: day++,
      activity: `Pack out, begin return trip`,
      cost: 0,
    });
    itinerary.push({
      day: day++,
      activity: `Arrive home`,
      cost: 0,
    });
  } else {
    itinerary.push({
      day: day++,
      activity: willFly
        ? `Return flight home`
        : `Drive home (${Math.round(driveHours)}h)`,
      cost: 0,
    });
  }

  const costBreakdown = {
    travel: Math.round(travelCost),
    lodging: Math.round(lodgingCost),
    food: Math.round(foodCost),
    tags: tagCost,
    total: Math.round(travelCost + lodgingCost + foodCost + tagCost),
  };

  const summary = `This hunt will take approximately ${totalDays} days and cost ~$${costBreakdown.total.toLocaleString()}`;

  return {
    totalDays,
    itinerary,
    costBreakdown,
    summary,
  };
}
