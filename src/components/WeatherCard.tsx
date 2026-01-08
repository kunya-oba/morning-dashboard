import { useEffect, useState } from 'react'
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Loader2 } from 'lucide-react'
import axios from 'axios'

interface WeatherData {
  temperature: number
  weatherCode: number
  precipitation: number
  windSpeed: number
  humidity: number
}

// WMO Weather interpretation codes
const getWeatherIcon = (code: number) => {
  if (code === 0) return <Sun className="w-12 h-12 text-yellow-500" />
  if (code <= 3) return <Cloud className="w-12 h-12 text-gray-400 dark:text-gray-300" />
  if (code <= 67) return <CloudRain className="w-12 h-12 text-blue-500" />
  if (code <= 77) return <CloudSnow className="w-12 h-12 text-blue-300" />
  return <CloudRain className="w-12 h-12 text-blue-600" />
}

const getWeatherDescription = (code: number): string => {
  if (code === 0) return '快晴'
  if (code === 1) return 'ほぼ晴れ'
  if (code === 2) return '一部曇り'
  if (code === 3) return '曇り'
  if (code <= 49) return '霧'
  if (code <= 59) return '霧雨'
  if (code <= 69) return '雨'
  if (code <= 79) return '雪'
  if (code <= 84) return 'にわか雨'
  return '雷雨'
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)

        // 東京の緯度経度
        const latitude = 35.6762
        const longitude = 139.6503

        const response = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=Asia/Tokyo`
        )

        const current = response.data.current
        setWeather({
          temperature: Math.round(current.temperature_2m),
          weatherCode: current.weather_code,
          precipitation: current.precipitation,
          windSpeed: current.wind_speed_10m,
          humidity: current.relative_humidity_2m
        })
      } catch (err) {
        console.error('天気情報の取得に失敗しました:', err)
        setError('天気情報を取得できませんでした')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    // 10分ごとに更新
    const interval = setInterval(fetchWeather, 600000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
        <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Sun className="w-7 h-7 text-yellow-500" />
          今日の天気
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
        <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Sun className="w-7 h-7 text-yellow-500" />
          今日の天気
        </h2>
        <div className="text-red-500 dark:text-red-400">
          <p>{error || '天気情報を読み込めませんでした'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <h2 className="text-2xl font-display font-semibold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <Sun className="w-7 h-7 text-yellow-500" />
        今日の天気
      </h2>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {getWeatherIcon(weather.weatherCode)}
          <div>
            <p className="text-4xl font-bold text-gray-800 dark:text-gray-100">
              {weather.temperature}°C
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
              {getWeatherDescription(weather.weatherCode)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col items-center">
          <Droplets className="w-5 h-5 text-blue-500 dark:text-blue-400 mb-1" />
          <p className="text-sm text-gray-500 dark:text-gray-400">降水量</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {weather.precipitation}mm
          </p>
        </div>

        <div className="flex flex-col items-center">
          <Wind className="w-5 h-5 text-gray-500 dark:text-gray-400 mb-1" />
          <p className="text-sm text-gray-500 dark:text-gray-400">風速</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {weather.windSpeed}m/s
          </p>
        </div>

        <div className="flex flex-col items-center">
          <Droplets className="w-5 h-5 text-cyan-500 dark:text-cyan-400 mb-1" />
          <p className="text-sm text-gray-500 dark:text-gray-400">湿度</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {weather.humidity}%
          </p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
        東京（10分ごとに更新）
      </div>
    </div>
  )
}
