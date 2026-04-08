'use client';
import { useEffect, useState } from 'react';

interface WeatherData {
  temperature_2m: number;
  weather_code: number;
  wind_speed_10m: number;
}

function weatherInfo(code: number): { label: string; icon: string } {
  if (code === 0) return { label: '快晴', icon: '☀' };
  if (code <= 2) return { label: '晴れ', icon: '🌤' };
  if (code === 3) return { label: '曇り', icon: '☁' };
  if (code <= 48) return { label: '霧', icon: '🌫' };
  if (code <= 55) return { label: '霧雨', icon: '🌦' };
  if (code <= 65) return { label: '雨', icon: '🌧' };
  if (code <= 77) return { label: '雪', icon: '🌨' };
  if (code <= 82) return { label: 'にわか雨', icon: '🌦' };
  return { label: '雷雨', icon: '⛈' };
}

export default function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetch('/api/weather').then(r => r.json()).then(setData).catch(() => {});
  }, []);

  if (!data) return null;

  const { label, icon } = weatherInfo(data.weather_code);

  return (
    <div className="bg-white border border-gray-200 rounded overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <span className="text-[12px] font-bold text-gray-700">天気 — 東京</span>
        <span className="text-[10px] text-gray-400">現在</span>
      </div>
      <div className="px-3 py-3 flex items-center gap-3">
        <span style={{ fontSize: 28, lineHeight: 1 }}>{icon}</span>
        <div>
          <div className="flex items-end gap-1">
            <span className="text-[22px] font-bold text-gray-800 leading-none">
              {Math.round(data.temperature_2m)}°
            </span>
            <span className="text-[11px] text-gray-500 mb-0.5">{label}</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            風速 {Math.round(data.wind_speed_10m)} km/h
          </div>
        </div>
      </div>
    </div>
  );
}
