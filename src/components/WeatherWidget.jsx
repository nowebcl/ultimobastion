import React, { useState, useEffect } from 'react'
import { CloudSun, CloudRain, Sun, Wind, Droplets } from 'lucide-react'

export default function WeatherWidget() {
  const [weather, setWeather] = useState({
    temp: 13,
    condition: 'Parcialmente nublado',
    wind: 16,
    humidity: 78,
    loading: false
  })

  useEffect(() => {
    // Fetch live weather for Maullín (-41.6167, -73.6)
    async function fetchWeather() {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-41.6167&longitude=-73.6&current_weather=true&hourly=relativehumidity_2m'
        )
        if (res.ok) {
          const data = await res.json()
          const current = data.current_weather
          if (current) {
            let cond = 'Despejado'
            const code = current.weathercode
            if (code >= 1 && code <= 3) cond = 'Parcialmente nublado'
            else if (code >= 45 && code <= 48) cond = 'Niebla costera'
            else if (code >= 51 && code <= 67) cond = 'Lluvia ligera'
            else if (code >= 80) cond = 'Chubascos'

            setWeather({
              temp: Math.round(current.temperature),
              condition: cond,
              wind: Math.round(current.windspeed),
              humidity: data.hourly?.relativehumidity_2m?.[0] || 75,
              loading: false
            })
          }
        }
      } catch (e) {
        // Fallback already in default state
      }
    }

    fetchWeather()
    const interval = setInterval(fetchWeather, 300000) // update every 5 min
    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = () => {
    if (weather.condition.includes('Lluvia') || weather.condition.includes('Chubascos')) {
      return <CloudRain className="w-4 h-4 text-sky-400" />
    }
    if (weather.condition.includes('nublado') || weather.condition.includes('Niebla')) {
      return <CloudSun className="w-4 h-4 text-amber-300" />
    }
    return <Sun className="w-4 h-4 text-amber-400" />
  }

  return (
    <div className="flex items-center gap-2 text-xs text-slate-200">
      <span className="font-semibold text-white">Maullín:</span>
      <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
        {getWeatherIcon()}
        <span className="font-medium text-white">{weather.temp}°C</span>
        <span className="hidden sm:inline text-slate-300 border-l border-white/20 pl-1.5">
          {weather.condition}
        </span>
      </div>
    </div>
  )
}
