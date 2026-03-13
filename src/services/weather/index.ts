// =============================================================================
// Weather Service — Open-Meteo integration for hunt planning
// =============================================================================

const LOG_PREFIX = "[weather]";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory cache for weather data
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();

// =============================================================================
// Types
// =============================================================================

export interface WeatherData {
  current: {
    temperature: number;
    windSpeed: number;
    precipitation: number;
    weatherCode: number;
    description: string;
  };
  forecast: {
    date: string;
    tempHigh: number;
    tempLow: number;
    precipitation: number;
    snowfall: number;
    windSpeed: number;
  }[];
  huntingConditions: string;
}

// =============================================================================
// State centroids for weather lookups
// =============================================================================

const STATE_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  CO: { lat: 39.0, lng: -105.5 },
  WY: { lat: 43.0, lng: -107.5 },
  MT: { lat: 47.0, lng: -109.6 },
  ID: { lat: 44.1, lng: -114.7 },
  AZ: { lat: 34.3, lng: -111.7 },
  NM: { lat: 34.5, lng: -106.0 },
  UT: { lat: 39.3, lng: -111.7 },
  NV: { lat: 39.9, lng: -116.9 },
  OR: { lat: 43.8, lng: -120.6 },
  WA: { lat: 47.4, lng: -120.7 },
  SD: { lat: 44.3, lng: -100.3 },
  ND: { lat: 47.5, lng: -100.5 },
  NE: { lat: 41.5, lng: -99.8 },
  KS: { lat: 38.5, lng: -98.3 },
  OK: { lat: 35.5, lng: -97.5 },
  TX: { lat: 31.5, lng: -99.4 },
};

// Weather code descriptions
const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  95: "Thunderstorm",
};

// =============================================================================
// fetchWeather — Get current and forecast weather for a location
// =============================================================================

export async function fetchWeather(
  stateCode: string,
  unitCode?: string
): Promise<WeatherData> {
  const cacheKey = `weather_${stateCode}_${unitCode ?? "state"}`;

  // Check cache
  const cached = getCachedWeather(cacheKey);
  if (cached) return cached;

  const coords = STATE_CENTROIDS[stateCode] ?? { lat: 39.0, lng: -105.5 };

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,wind_speed_10m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max&timezone=America/Denver&forecast_days=7`;

    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      console.warn(`${LOG_PREFIX} Open-Meteo API error: ${res.status}`);
      return getDefaultWeather();
    }

    const data = await res.json();

    const weather: WeatherData = {
      current: {
        temperature: Math.round(data.current?.temperature_2m ?? 0),
        windSpeed: Math.round(data.current?.wind_speed_10m ?? 0),
        precipitation: data.current?.precipitation ?? 0,
        weatherCode: data.current?.weather_code ?? 0,
        description:
          WEATHER_CODES[data.current?.weather_code ?? 0] ?? "Unknown",
      },
      forecast: (data.daily?.time ?? []).map((date: string, i: number) => ({
        date,
        tempHigh: Math.round(data.daily?.temperature_2m_max?.[i] ?? 0),
        tempLow: Math.round(data.daily?.temperature_2m_min?.[i] ?? 0),
        precipitation: data.daily?.precipitation_sum?.[i] ?? 0,
        snowfall: data.daily?.snowfall_sum?.[i] ?? 0,
        windSpeed: Math.round(data.daily?.wind_speed_10m_max?.[i] ?? 0),
      })),
      huntingConditions: "",
    };

    // Generate hunting conditions description
    weather.huntingConditions = generateHuntingConditions(
      weather,
      stateCode
    );

    // Cache result
    cacheWeather(cacheKey, weather);

    return weather;
  } catch (error) {
    console.error(`${LOG_PREFIX} Error fetching weather:`, error);
    return getDefaultWeather();
  }
}

// =============================================================================
// Helpers
// =============================================================================

function generateHuntingConditions(
  weather: WeatherData,
  stateCode: string
): string {
  const temp = weather.current.temperature;
  const wind = weather.current.windSpeed;
  const conditions: string[] = [];

  if (temp < -10) {
    conditions.push("Extreme cold — layer up and limit exposure time");
  } else if (temp < 0) {
    conditions.push("Cold conditions — animals will be active feeding");
  } else if (temp > 30) {
    conditions.push("Hot conditions — focus on early morning and late evening hunts");
  } else {
    conditions.push("Moderate temperatures — good hunting conditions");
  }

  if (wind > 30) {
    conditions.push("High winds may push animals to sheltered areas");
  } else if (wind > 15) {
    conditions.push("Breezy — use wind to mask approach sounds");
  }

  const hasSnow = weather.forecast.some((d) => d.snowfall > 0);
  if (hasSnow) {
    conditions.push("Snow in forecast — fresh tracks will be visible");
  }

  return conditions.join(". ") + ".";
}

function getCachedWeather(cacheKey: string): WeatherData | null {
  const entry = weatherCache.get(cacheKey);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  weatherCache.delete(cacheKey);
  return null;
}

function cacheWeather(cacheKey: string, data: WeatherData): void {
  weatherCache.set(cacheKey, { data, timestamp: Date.now() });
  // Evict old entries if cache grows too large
  if (weatherCache.size > 200) {
    const oldest = weatherCache.keys().next().value;
    if (oldest) weatherCache.delete(oldest);
  }
}

function getDefaultWeather(): WeatherData {
  return {
    current: {
      temperature: 0,
      windSpeed: 0,
      precipitation: 0,
      weatherCode: 0,
      description: "Data unavailable",
    },
    forecast: [],
    huntingConditions: "Weather data is currently unavailable. Check local forecasts before heading out.",
  };
}
