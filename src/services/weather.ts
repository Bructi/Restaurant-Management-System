export interface WeatherForecastData {
  temperature: number;
  humidity: number;
  weatherCode: number;
  weatherDescription: string;
  weatherIcon: string;
  diningImpact: string;
  patioRecommendation: string;
}

export async function fetchLiveWeatherAndDiningRush(): Promise<WeatherForecastData> {
  try {
    // Open-Meteo free public API for Bengaluru coordinates (12.9716, 77.5946)
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto'
    );
    if (!res.ok) throw new Error('Weather API fetch failed');
    const data = await res.json();
    const current = data.current || {};
    const temp = Math.round(current.temperature_2m ?? 26);
    const humidity = Math.round(current.relative_humidity_2m ?? 65);
    const code = Number(current.weather_code ?? 0);

    let weatherDesc = 'Pleasant & Clear';
    let icon = 'wb_sunny';
    let impact = 'High Walk-in Velocity expected (+15% Patio Demand)';
    let patio = 'Garden Terrace Seating: 100% Recommended';

    if (code >= 51 && code <= 67) {
      weatherDesc = 'Light Drizzle & Rain';
      icon = 'rainy';
      impact = 'Shift to Indoor Seating & +35% Hot Soup / Tandoori Demand';
      patio = 'Enclose Garden Patio & deploy rain canopies';
    } else if (code >= 80) {
      weatherDesc = 'Thunderstorms';
      icon = 'thunderstorm';
      impact = 'High Delivery Volume spike (+40% Aggregator orders)';
      patio = 'Move all outdoor reservations indoors';
    } else if (temp > 32) {
      weatherDesc = 'Warm & Sunny';
      icon = 'sunny';
      impact = 'Surge in Cold Beverage & Mocktail orders (+28%)';
      patio = 'Activate Mist Cooling Fans on Terrace';
    } else if (temp < 20) {
      weatherDesc = 'Cool Evening Breeze';
      icon = 'air';
      impact = 'High Hot Gravy & Biryani velocity';
      patio = 'Deploy outdoor gas patio heaters';
    }

    return {
      temperature: temp,
      humidity,
      weatherCode: code,
      weatherDescription: weatherDesc,
      weatherIcon: icon,
      diningImpact: impact,
      patioRecommendation: patio,
    };
  } catch {
    // Graceful fallback without breaking anything
    return {
      temperature: 25,
      humidity: 62,
      weatherCode: 0,
      weatherDescription: 'Pleasant Evening (25°C)',
      weatherIcon: 'wb_sunny',
      diningImpact: 'High Dinner Rush (+18% Dine-in Pacing)',
      patioRecommendation: 'Garden Terrace 100% Operational',
    };
  }
}
