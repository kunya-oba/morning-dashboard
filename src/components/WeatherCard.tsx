import { useEffect, useState } from 'react'
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Droplets, Loader2 } from 'lucide-react'
import axios from 'axios'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDarkMode } from '../hooks/useDarkMode'
import { OpenMeteoResponse } from '../types/api'
import { logger } from '../utils/logger'
import { INTERVALS } from '../constants/intervals'

interface WeatherData {
  temperature: number
  weatherCode: number
  precipitation: number
  windSpeed: number
  humidity: number
}

interface HourlyTemperature {
  time: string
  temperature: number
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
  const [hourlyData, setHourlyData] = useState<HourlyTemperature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isDark = useDarkMode()

  useEffect(() => {
    const controller = new AbortController()

    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)

        // 東京の緯度経度
        const latitude = 35.6762
        const longitude = 139.6503

        // 現在の天気と24時間の気温予報を取得
        const response = await axios.get<OpenMeteoResponse>(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m&timezone=Asia/Tokyo&forecast_days=1`,
          { signal: controller.signal }
        )

        const current = response.data.current
        setWeather({
          temperature: Math.round(current.temperature_2m),
          weatherCode: current.weather_code,
          precipitation: current.precipitation,
          windSpeed: current.wind_speed_10m,
          humidity: current.relative_humidity_2m
        })

        // 1時間ごとの気温データを整形（今日の分のみ、3時間おきに表示）
        const hourly = response.data.hourly
        const now = new Date()
        const hourlyTemps: HourlyTemperature[] = []

        for (let i = 0; i < hourly.time.length; i += 3) {
          const timeStr = hourly.time[i]
          const date = new Date(timeStr)

          // 今日の日付のデータのみ
          if (date.getDate() === now.getDate()) {
            hourlyTemps.push({
              time: `${date.getHours()}時`,
              temperature: Math.round(hourly.temperature_2m[i])
            })
          }
        }

        setHourlyData(hourlyTemps)
      } catch (err) {
        if (axios.isCancel(err)) {
          return
        }
        logger.error('天気情報の取得に失敗しました:', err)
        setError('天気情報を取得できませんでした')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    // 10分ごとに更新
    const interval = setInterval(fetchWeather, INTERVALS.WEATHER_UPDATE)

    return () => {
      controller.abort()
      clearInterval(interval)
    }
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

      {/* 今日の気温変化グラフ */}
      {hourlyData.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            今日の気温変化
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={hourlyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#374151' : '#e5e7eb'}
              />
              <XAxis
                dataKey="time"
                tick={{
                  fill: isDark ? '#9ca3af' : '#6b7280',
                  fontSize: 12
                }}
                stroke={isDark ? '#4b5563' : '#9ca3af'}
              />
              <YAxis
                tick={{
                  fill: isDark ? '#9ca3af' : '#6b7280',
                  fontSize: 12
                }}
                stroke={isDark ? '#4b5563' : '#9ca3af'}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark
                    ? 'rgba(31, 41, 55, 0.95)'
                    : 'rgba(255, 255, 255, 0.95)',
                  border: isDark
                    ? '1px solid #374151'
                    : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                labelStyle={{
                  color: isDark ? '#e5e7eb' : '#374151',
                  fontWeight: 'bold'
                }}
                itemStyle={{ color: '#f59e0b' }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
                name="気温"
                unit="°C"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

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
