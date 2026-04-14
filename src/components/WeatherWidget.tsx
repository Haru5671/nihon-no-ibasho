'use client';
import { useEffect, useState, useRef } from 'react';

interface WeatherData {
  temperature_2m: number;
  weather_code: number;
  wind_speed_10m: number;
}

interface Location {
  name: string;
  lat: number;
  lon: number;
}

const PRESET_CITIES: Location[] = [
  { name: '東京', lat: 35.6762, lon: 139.6503 },
  { name: '大阪', lat: 34.6937, lon: 135.5023 },
  { name: '名古屋', lat: 35.1815, lon: 136.9066 },
  { name: '札幌', lat: 43.0642, lon: 141.3469 },
  { name: '福岡', lat: 33.5904, lon: 130.4017 },
  { name: '仙台', lat: 38.2688, lon: 140.8721 },
  { name: '広島', lat: 34.3853, lon: 132.4553 },
  { name: '京都', lat: 35.0116, lon: 135.7681 },
  { name: '神戸', lat: 34.6901, lon: 135.1956 },
  { name: '横浜', lat: 35.4437, lon: 139.6380 },
];

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

const STORAGE_KEY = 'ibasho_weather_location';

function getSavedLocation(): Location {
  if (typeof window === 'undefined') return PRESET_CITIES[0];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return PRESET_CITIES[0];
}

export default function WeatherWidget({ compact }: { compact?: boolean }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<Location>(PRESET_CITIES[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [locating, setLocating] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = getSavedLocation();
    setLocation(saved);
  }, []);

  useEffect(() => {
    fetch(`/api/weather?lat=${location.lat}&lon=${location.lon}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPicker]);

  const selectCity = (city: Location) => {
    setLocation(city);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
    setShowPicker(false);
    setData(null);
  };

  const useGeolocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: Location = {
          name: '現在地',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setLocation(loc);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
        setShowPicker(false);
        setData(null);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const { label, icon } = data ? weatherInfo(data.weather_code) : { label: '', icon: '…' };

  if (compact) {
    return (
      <a
        href="https://tenki.jp/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 hover:bg-surface-container-low transition-colors"
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>{data ? icon : '…'}</span>
        <span className="text-[13px] font-bold text-on-surface">
          {data ? `${Math.round(data.temperature_2m)}°` : '--'}
        </span>
        <span className="text-[10px] text-on-surface-variant">{location.name}</span>
        <span className="text-[9px] text-outline ml-auto">↗</span>
      </a>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-card overflow-hidden relative">
      <div className="px-4 py-3 bg-surface-container-low flex items-center justify-between">
        <a
          href="https://tenki.jp/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-bold text-primary font-headline hover:text-primary/80 transition-colors"
        >
          天気 — {location.name} ↗
        </a>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-[11px] text-primary hover:underline"
        >
          変更
        </button>
      </div>

      {!data ? (
        <div className="px-4 py-3 text-[12px] text-outline">読み込み中...</div>
      ) : (
        <div className="px-4 py-3 flex items-center gap-3">
          <span style={{ fontSize: 30, lineHeight: 1 }}>{icon}</span>
          <div>
            <div className="flex items-end gap-1.5">
              <span className="text-[24px] font-bold text-on-surface leading-none">
                {Math.round(data.temperature_2m)}°
              </span>
              <span className="text-[12px] text-on-surface-variant mb-0.5">{label}</span>
            </div>
            <div className="text-[11px] text-outline mt-0.5">
              風速 {Math.round(data.wind_speed_10m)} km/h
            </div>
          </div>
        </div>
      )}

      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute top-full left-0 right-0 z-50 bg-surface-container-lowest rounded-b-2xl shadow-float"
        >
          <button
            onClick={useGeolocation}
            disabled={locating}
            className="w-full text-left px-4 py-2.5 text-[12px] text-primary hover:bg-surface-container-low font-semibold flex items-center gap-1.5 border-b border-outline-variant/20"
          >
            <span>📍</span>
            {locating ? "取得中..." : "現在地を使用"}
          </button>
          {PRESET_CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => selectCity(city)}
              className={`w-full text-left px-4 py-2 text-[12px] hover:bg-surface-container-low transition-colors ${
                location.name === city.name ? "text-primary font-semibold" : "text-on-surface"
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
