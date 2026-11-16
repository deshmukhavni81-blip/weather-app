

import React, { useState } from "react";
import "./App.css";

function getWeatherInfo(code) {
  if (code === 0) return ["☀️", "Clear"];
  if (code <= 2) return ["🌤️", "Partly Cloudy"];
  if (code === 3) return ["☁️", "Cloudy"];
  if (code === 45 || code === 48) return ["🌫️", "Foggy"];
  if (code >= 51 && code <= 67) return ["🌧️", "Drizzle / Rain"];
  if (code >= 71 && code <= 77) return ["❄️", "Snow"];
  if (code >= 80 && code <= 82) return ["🌦️", "Rain Showers"];
  if (code >= 85 && code <= 86) return ["🌨️", "Snow Showers"];
  if (code >= 95) return ["⛈️", "Thunderstorm"];
  return ["🌤️", "Weather"];
}

function App() {
  const [city, setCity] = useState("Nagpur");
  const [place, setPlace] = useState("Nagpur");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name!");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const cityResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1`
      );

      const cityData = await cityResponse.json();

      if (!cityData.results) {
        setError("City not found!");
        setWeather(null);
        setForecast(null);
        return;
      }

      const location = cityData.results[0];

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,apparent_temperature,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`
      );

      const data = await response.json();

      setWeather(data.current);
      setForecast(data.daily);
      setPlace(location.name);

    } catch (error) {
      setError("Unable to get weather data!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="weather-box">

        <h1>🌤 Weather App</h1>
        <p className="subtitle">
          Check the weather of your city
        </p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") getWeather();
            }}
          />

          <button onClick={getWeather}>
            Search
          </button>
        </div>

        {loading && <p>Loading weather...</p>}
        {error && <p className="error">{error}</p>}

        {weather && !loading && (
          <>
            <div className="weather-info">

              <h2>📍 {place}</h2>

              <div className="temperature">
                {weather.temperature_2m}°C
              </div>

              <p className="weather-text">
                Current Weather
              </p>

              <div className="cards">

                <div className="card">
                  <h3>🌬️</h3>
                  <p>Wind Speed</p>
                  <h2>{weather.wind_speed_10m} km/h</h2>
                </div>

                <div className="card">
                  <h3>💧</h3>
                  <p>Humidity</p>
                  <h2>{weather.relative_humidity_2m}%</h2>
                </div>

                <div className="card">
                  <h3>🌡️</h3>
                  <p>Feels Like</p>
                  <h2>{weather.apparent_temperature}°C</h2>
                </div>

              </div>
            </div>

            {forecast && (
              <div className="forecast-section">

                <h2>📅 7-Day Weather Forecast</h2>

                <div className="forecast-cards">

                  {forecast.time.map((day, index) => {
                    const info = getWeatherInfo(
                      forecast.weather_code[index]
                    );

                    return (
                      <div className="forecast-card" key={day}>

                        <h3>
                          {new Date(day + "T12:00:00")
                            .toLocaleDateString("en-US", {
                              weekday: "short"
                            })}
                        </h3>

                        <div className="forecast-icon">
                          {info[0]}
                        </div>

                        <p>{info[1]}</p>

                        <h3>
                          {Math.round(forecast.temperature_2m_max[index])}°
                          {" / "}
                          {Math.round(forecast.temperature_2m_min[index])}°
                        </h3>

                        <small>
                          💧 {forecast.precipitation_probability_max[index] ?? 0}%
                        </small>

                      </div>
                    );
                  })}

                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default App;
