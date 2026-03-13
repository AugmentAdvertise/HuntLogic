import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchWeather } from "@/services/weather";
import { fetchDroughtData, calculateWinterSeverity } from "@/services/weather/drought";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stateCode = request.nextUrl.searchParams.get("state");
  const unitCode = request.nextUrl.searchParams.get("unit") ?? undefined;

  if (!stateCode) {
    return NextResponse.json(
      { error: "Missing state parameter" },
      { status: 400 }
    );
  }

  try {
    const [weather, drought] = await Promise.all([
      fetchWeather(stateCode, unitCode),
      fetchDroughtData(stateCode),
    ]);

    // Calculate winter severity from forecast if available
    const snowDays = weather.forecast.filter((d) => d.snowfall > 0).length;
    const avgSnowfall =
      weather.forecast.length > 0
        ? weather.forecast.reduce((s, d) => s + d.snowfall, 0) /
          weather.forecast.length
        : 0;
    const coldDays = weather.forecast.filter((d) => d.tempLow < -18).length; // 0°F
    const winterSeverity = calculateWinterSeverity(
      avgSnowfall,
      snowDays,
      coldDays,
      weather.forecast.length || 1
    );

    return NextResponse.json({
      current: weather.current,
      forecast: weather.forecast,
      drought,
      winterSeverity: Math.round(winterSeverity * 100) / 100,
      huntingConditions: weather.huntingConditions,
    });
  } catch (error) {
    console.error("[api/weather] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
