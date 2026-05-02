import { useState } from "react";
import Weather from "@/components/Weather";

const bgMap: Record<string, string> = {
  Clear: "bg-weather-clear",
  Clouds: "bg-weather-clouds",
  Rain: "bg-weather-rain",
  Drizzle: "bg-weather-rain",
  Snow: "bg-weather-snow",
  Thunderstorm: "bg-weather-storm",
};

const Index = () => {
  const [main, setMain] = useState<string>("Clear");
  const bgClass = bgMap[main] ?? "bg-weather-default";

  return (
    <main
      className={`${bgClass} min-h-screen w-full transition-all duration-1500 ease-in-out px-4 py-2 flex items-start sm:items-center justify-center`}
    >
      <Weather onWeatherChange={setMain} />
    </main>
  );
};

export default Index;
