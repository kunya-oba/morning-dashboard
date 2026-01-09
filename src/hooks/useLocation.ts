import { useState, useEffect } from 'react'
import { Location, JAPAN_CITIES } from '../types/location'
import { logger } from '../utils/logger'
import { calculateDistance } from '../utils/geo'

interface UseLocationReturn {
  locations: Location[]
  currentLocation: Location | null
  setCurrentLocation: (location: Location) => void
  addLocation: (location: Location) => void
  removeLocation: (id: string) => void
  getCurrentPosition: () => Promise<Location | null>
  isLoadingGeo: boolean
}

/**
 * 位置情報を管理するカスタムフック
 * - 複数の位置情報を登録・管理
 * - LocalStorageで永続化
 * - Geolocation APIで現在地を取得
 */
export function useLocation(): UseLocationReturn {
  // デフォルトの主要都市
  const defaultCities: Location[] = [
    {
      id: 'tokyo',
      name: '東京',
      latitude: 35.6762,
      longitude: 139.6503,
      country: '日本'
    },
    {
      id: 'osaka',
      name: '大阪',
      latitude: 34.6937,
      longitude: 135.5023,
      country: '日本'
    },
    {
      id: 'nagoya',
      name: '名古屋',
      latitude: 35.1815,
      longitude: 136.9066,
      country: '日本'
    },
    {
      id: 'sapporo',
      name: '札幌',
      latitude: 43.0642,
      longitude: 141.3469,
      country: '日本'
    },
    {
      id: 'fukuoka',
      name: '福岡',
      latitude: 33.5904,
      longitude: 130.4017,
      country: '日本'
    }
  ]

  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('locations')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Location[]

        // マイグレーション: デフォルト都市を追加
        const migratedLocations = [...parsed]
        defaultCities.forEach(city => {
          if (!migratedLocations.some(loc => loc.id === city.id)) {
            migratedLocations.push(city)
            logger.log(`位置情報を追加: ${city.name}`)
          }
        })

        // マイグレーション後のデータを保存
        if (migratedLocations.length > parsed.length) {
          localStorage.setItem('locations', JSON.stringify(migratedLocations))
          logger.log('位置情報をマイグレーション:', migratedLocations)
        }

        return migratedLocations
      } catch (e) {
        logger.error('位置情報の復元に失敗:', e)
      }
    }
    // デフォルトは主要都市
    return defaultCities
  })

  const [currentLocation, setCurrentLocationState] = useState<Location | null>(() => {
    const savedId = localStorage.getItem('currentLocationId')
    if (savedId) {
      const saved = localStorage.getItem('locations')
      if (saved) {
        try {
          const locs = JSON.parse(saved) as Location[]
          return locs.find(loc => loc.id === savedId) || locs[0] || null
        } catch (e) {
          logger.error('現在位置の復元に失敗:', e)
        }
      }
    }
    // デフォルトは東京
    return {
      id: 'tokyo',
      name: '東京',
      latitude: 35.6762,
      longitude: 139.6503,
      country: '日本'
    }
  })

  const [isLoadingGeo, setIsLoadingGeo] = useState(false)

  // LocalStorageに保存
  useEffect(() => {
    localStorage.setItem('locations', JSON.stringify(locations))
  }, [locations])

  useEffect(() => {
    if (currentLocation) {
      localStorage.setItem('currentLocationId', currentLocation.id)
    }
  }, [currentLocation])

  const setCurrentLocation = (location: Location) => {
    setCurrentLocationState(location)
  }

  const addLocation = (location: Location) => {
    setLocations(prev => {
      // 既に存在する場合は追加しない
      if (prev.some(loc => loc.id === location.id)) {
        return prev
      }
      return [...prev, location]
    })
  }

  const removeLocation = (id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id))

    // 削除した位置が現在地の場合、最初の位置に切り替え
    if (currentLocation?.id === id) {
      const remaining = locations.filter(loc => loc.id !== id)
      if (remaining.length > 0) {
        setCurrentLocation(remaining[0])
      }
    }
  }

  const getCurrentPosition = async (): Promise<Location | null> => {
    if (!navigator.geolocation) {
      logger.error('Geolocation APIがサポートされていません')
      return null
    }

    setIsLoadingGeo(true)

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords

          // 最も近い都市を見つける（Haversine公式を使用）
          let closestCity = JAPAN_CITIES[0]
          let minDistance = Infinity

          JAPAN_CITIES.forEach(city => {
            const distance = calculateDistance(
              latitude,
              longitude,
              city.latitude,
              city.longitude
            )
            if (distance < minDistance) {
              minDistance = distance
              closestCity = city
            }
          })

          const location: Location = {
            id: `current-${Date.now()}`,
            name: `${closestCity.name}付近`,
            latitude,
            longitude,
            country: '日本',
            isCurrentLocation: true
          }

          logger.log('現在地を取得:', location)
          setIsLoadingGeo(false)
          resolve(location)
        },
        (error) => {
          logger.error('位置情報の取得に失敗:', error.message)
          setIsLoadingGeo(false)
          resolve(null)
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000 // 5分間キャッシュ
        }
      )
    })
  }

  return {
    locations,
    currentLocation,
    setCurrentLocation,
    addLocation,
    removeLocation,
    getCurrentPosition,
    isLoadingGeo
  }
}
