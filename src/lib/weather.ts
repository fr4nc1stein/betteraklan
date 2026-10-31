import { HourlyForecast, WeatherData } from '../types';
import municipalityCentroids from '../data/geo/municipality-centroids.json';
import { fetchWithCache } from './api';
import { config } from './lguConfig';

/**
 * Map OpenWeatherMap icon codes to Lucide icon names
 */
export const mapWeatherIconToLucide = (iconCode: string): string => {
  const iconMap: Record<string, string> = {
    '01d': 'Sun',
    '01n': 'Moon',
    '02d': 'CloudSun',
    '02n': 'CloudMoon',
    '03d': 'Cloud',
    '03n': 'Cloud',
    '04d': 'Cloud',
    '04n': 'Cloud',
    '09d': 'CloudDrizzle',
    '09n': 'CloudDrizzle',
    '10d': 'CloudRain',
    '10n': 'CloudRain',
    '11d': 'CloudLightning',
    '11n': 'CloudLightning',
    '13d': 'CloudSnow',
    '13n': 'CloudSnow',
    '50d': 'Cloud',
    '50n': 'Cloud',
  };
  return iconMap[iconCode] || 'Cloud';
};

// Raw shape returned per-city by /api/weather (OpenWeatherMap-flavored JSON)
interface RawCityWeather {
  name?: string;
  weather?: Array<{ description: string; icon: string }>;
  main?: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  wind?: { speed: number };
  visibility?: number;
  hourly?: HourlyForecast[];
}

function transformCityWeather(
  city: RawCityWeather,
  fallbackName: string
): WeatherData {
  const hourly: HourlyForecast[] = (city.hourly || [])
    .slice(0, 4)
    .map((h: HourlyForecast) => ({
      hour: new Date(h.dt * 1000).toLocaleTimeString([], {
        hour: 'numeric',
        hour12: true,
      }),
      temperature: Math.round(h.temp),
      icon: mapWeatherIconToLucide(h.icon),
    }));

  return {
    location: city.name || fallbackName,
    temperature: Math.round(city.main?.temp ?? 0),
    condition: city.weather?.[0]?.description ?? 'Unknown',
    humidity: city.main?.humidity ?? 0,
    windSpeed: city.wind?.speed ?? 0,
    icon: mapWeatherIconToLucide(city.weather?.[0]?.icon ?? '01d'),
    hourly,
    pressure: city.main?.pressure ?? 0,
    visibility: Math.round((city.visibility ?? 0) / 1000),
  };
}

/**
 * Fetch weather for an arbitrary configured city (see functions/api/weather.ts
 * DEFAULT_CITY/ADDITIONAL_CITIES) and transform to the frontend type.
 */
export const fetchWeatherForCity = async (
  cityName: string
): Promise<WeatherData | null> => {
  const cityKey = cityName.toLowerCase().replace(/\s+/g, '_');

  let data = await fetchWithCache(
    `/api/weather?city=${encodeURIComponent(cityName)}`
  );

  if (!data || Object.keys(data).length === 0) {
    data = await fetchWithCache('/api/weather?update=true');
  }

  const city =
    data[cityKey] || data[cityName.toLowerCase()] || data[Object.keys(data)[0]];
  if (!city) {
    console.warn(`No weather data returned for ${cityName}`);
    return null;
  }

  return transformCityWeather(city, cityName);
};

/**
 * Fetch weather data for configured LGU and transform to frontend type
 */
export const fetchWeatherData = async (): Promise<WeatherData[]> => {
  const cityName = config.location.weather.defaultCity;
  const weatherData = await fetchWeatherForCity(cityName);
  return weatherData ? [weatherData] : [];
};

export interface MunicipalityWeather extends WeatherData {
  slug: string;
}

/**
 * Fetch weather for all 17 Aklan municipalities in one request (powers the
 * /map weather overlay). Backend keys weather by a name-derived slug, so
 * results are matched back to municipality slugs via
 * src/data/geo/municipality-centroids.json (see functions/api/weather.ts).
 */
export const fetchAllMunicipalitiesWeather = async (): Promise<
  Record<string, MunicipalityWeather>
> => {
  let data =
    await fetchWithCache<Record<string, RawCityWeather>>('/api/weather');

  if (!data || Object.keys(data).length === 0) {
    data = await fetchWithCache<Record<string, RawCityWeather>>(
      '/api/weather?update=true'
    );
  }

  const result: Record<string, MunicipalityWeather> = {};
  for (const centroid of municipalityCentroids) {
    const cityKey = centroid.name.toLowerCase().replace(/\s+/g, '_');
    const city = data[cityKey];
    if (city) {
      result[centroid.slug] = {
        ...transformCityWeather(city, centroid.name),
        slug: centroid.slug,
      };
    }
  }
  return result;
};
