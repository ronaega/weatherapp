import { useEffect, useState } from "react";
import axios from "axios";
import {
  WiDaySunny,
  WiCloud,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiHumidity,
  WiDayCloudy,
} from "react-icons/wi";
import { FiSearch, FiMapPin } from "react-icons/fi";

// 🔑 Replace with your OpenWeatherMap API key
const API_KEY = import.meta.env.VITE_API_KEY;
const BASE = "https://api.openweathermap.org/data/2.5/weather";

export type WeatherData = {
  name: string;
  main: { temp: number; humidity: number };
  weather: { main: string; description: string }[];
};

type Props = {
  onWeatherChange?: (main: string) => void;
};

const getIcon = (main: string, size = 120) => {
  const cls = "drop-shadow-lg";
  switch (main) {
    case "Clear":
      return <WiDaySunny size={size} className={`${cls} text-yellow-300 animate-spin-slow`} />;
    case "Clouds":
      return <WiCloud size={size} className={`${cls} text-white animate-sway`} />;
    case "Rain":
    case "Drizzle":
      return <WiRain size={size} className={`${cls} text-blue-100 animate-pulse-soft`} />;
    case "Snow":
      return <WiSnow size={size} className={`${cls} text-white animate-float`} />;
    case "Thunderstorm":
      return <WiThunderstorm size={size} className={`${cls} text-purple-200 animate-pulse-soft`} />;
    default:
      return <WiDayCloudy size={size} className={`${cls} text-white animate-float`} />;
  }
};

const WeatherCard = ({ data, badge }: { data: WeatherData; badge: string }) => {
  const main = data.weather[0]?.main ?? "Clear";
  return (
    <div className="glass rounded-3xl p-7 sm:p-8 w-full animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-widest text-white/80 font-semibold flex items-center gap-1">
          {badge === "auto" ? <FiMapPin size={12} /> : <FiSearch size={12} />}
          {badge === "auto" ? "Now" : "Searched"}
        </span>
        <span className="text-xs text-white/70 capitalize">{data.weather[0]?.description}</span>
      </div>

      <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-md mb-1">
        {data.name}
      </h2>

      <div className="flex items-center justify-between mt-4">
        <div className="flex flex-col">
          <span className="text-6xl sm:text-7xl font-light text-white drop-shadow-md leading-none">
            {Math.round(data.main.temp)}°
          </span>
          <span className="text-white/80 text-sm mt-2 capitalize">{main}</span>
        </div>
        <div className="-mr-4">{getIcon(main, 130)}</div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-white/90 text-sm bg-white/10 rounded-full px-4 py-2 w-fit">
        <WiHumidity size={28} className="text-white" />
        <span>Humidity {data.main.humidity}%</span>
      </div>
    </div>
  );
};

const Weather = ({ onWeatherChange }: Props) => {
  const [autoData, setAutoData] = useState<WeatherData | null>(null);
  const [autoLoading, setAutoLoading] = useState(true);

  const [city, setCity] = useState("");
  const [searchData, setSearchData] = useState<WeatherData | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto location on load
  useEffect(() => {
    if (!navigator.geolocation) {
      setAutoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { data } = await axios.get<WeatherData>(BASE, {
            params: {
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              units: "metric",
              appid: API_KEY,
            },
          });
          setAutoData(data);
          onWeatherChange?.(data.weather[0]?.main ?? "Clear");
        } catch {
          // silent fail
        } finally {
          setAutoLoading(false);
        }
      },
      () => setAutoLoading(false),
      { timeout: 10000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    setError("");
    setSearchLoading(true);
    try {
      const { data } = await axios.get<WeatherData>(BASE, {
        params: { q: city.trim(), units: "metric", appid: API_KEY },
      });
      setSearchData(data);
      onWeatherChange?.(data.weather[0]?.main ?? "Clear");
    } catch {
      setSearchData(null);
      setError("City not found 💔");
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-5">
      <header className="text-center pt-6 pb-2">
        <h1 className="font-script text-5xl sm:text-6xl text-white drop-shadow-lg">
          Bloom Weather
        </h1>
        <p className="text-white/85 text-sm mt-1 tracking-wide">A little forecast, with love 🌸</p>
      </header>

      {/* Auto location card */}
      {autoLoading ? (
        <div className="glass rounded-3xl p-8 text-center text-white animate-fade-in">
          <div className="inline-block w-8 h-8 border-2 border-white/40 border-t-white rounded-full animate-spin mb-3" />
          <p className="text-sm tracking-wide">Loading weather…</p>
        </div>
      ) : autoData ? (
        <WeatherCard data={autoData} badge="auto" />
      ) : (
        <div className="glass rounded-3xl p-6 text-center text-white/90 text-sm animate-fade-in">
          Enable location to see your local weather, or search a city below.
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 animate-fade-in">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Type any city you want"
          className="glass-input flex-1 rounded-2xl px-5 py-3 text-white placeholder-white/70 text-sm outline-none focus:ring-2 focus:ring-white/60 transition"
        />
        <button
          type="submit"
          disabled={searchLoading}
          className="rounded-2xl px-5 py-3 bg-white/90 hover:bg-white text-pink-600 font-semibold text-sm shadow-lg transition active:scale-95 disabled:opacity-60"
        >
          {searchLoading ? "…" : "Search"}
        </button>
      </form>

      {error && (
        <div className="glass rounded-2xl px-5 py-4 text-center text-white text-sm animate-fade-in">
          {error}
        </div>
      )}

      {searchData && <WeatherCard data={searchData} badge="search" />}

      <footer className="text-center text-white/70 text-xs pb-6 pt-2">
        Powered by OpenWeatherMap
      </footer>
    </div>
  );
};

export default Weather;
