import { useState } from 'react'
import { MapPin, Plus, Trash2, Navigation, Check, Search, Loader2 } from 'lucide-react'
import { Location, ALL_CITY_PRESETS, JAPAN_CITIES, WORLD_CITIES } from '../types/location'

interface LocationSettingsCardProps {
  locations: Location[]
  currentLocation: Location | null
  onSetCurrentLocation: (location: Location) => void
  onAddLocation: (location: Location) => void
  onRemoveLocation: (id: string) => void
  onGetCurrentPosition: () => Promise<Location | null>
  isLoadingGeo: boolean
}

export default function LocationSettingsCard({
  locations,
  currentLocation,
  onSetCurrentLocation,
  onAddLocation,
  onRemoveLocation,
  onGetCurrentPosition,
  isLoadingGeo
}: LocationSettingsCardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showPresets, setShowPresets] = useState(false)

  const handleGetCurrentPosition = async () => {
    const location = await onGetCurrentPosition()
    if (location) {
      onAddLocation(location)
      onSetCurrentLocation(location)
      setShowPresets(false)
    }
  }

  const handleAddPreset = (preset: typeof ALL_CITY_PRESETS[0]) => {
    const location: Location = {
      id: preset.id,
      name: preset.name,
      latitude: preset.latitude,
      longitude: preset.longitude,
      country: preset.country
    }
    onAddLocation(location)
    setShowPresets(false)
    setSearchQuery('')
  }

  const filteredJapanCities = JAPAN_CITIES.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.prefecture?.includes(searchQuery)
  )

  const filteredWorldCities = WORLD_CITIES.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.country.includes(searchQuery)
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <h2 className="text-2xl font-display font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-6">
        <MapPin className="w-7 h-7 text-purple-500" />
        位置情報設定
      </h2>

      {/* 現在地取得ボタン */}
      <div className="mb-6">
        <button
          onClick={handleGetCurrentPosition}
          disabled={isLoadingGeo}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-xl transition-colors"
        >
          {isLoadingGeo ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              位置情報を取得中...
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5" />
              現在地を取得
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          ブラウザの位置情報許可が必要です
        </p>
      </div>

      {/* 登録済み位置情報 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          登録済みの位置情報
        </h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {locations.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
              位置情報が登録されていません
            </p>
          ) : (
            locations.map((location) => (
              <div
                key={location.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  currentLocation?.id === location.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <button
                  onClick={() => onSetCurrentLocation(location)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <div className="flex-shrink-0">
                    {currentLocation?.id === location.id ? (
                      <Check className="w-5 h-5 text-purple-500" />
                    ) : (
                      <MapPin className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      {location.name}
                      {location.isCurrentLocation && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full">
                          現在地
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {location.country} • {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </p>
                  </div>
                </button>
                {locations.length > 1 && (
                  <button
                    onClick={() => onRemoveLocation(location.id)}
                    className="flex-shrink-0 ml-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    aria-label="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 都市を追加 */}
      <div>
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          都市を追加
        </button>

        {showPresets && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            {/* 検索ボックス */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="都市名で検索..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* 日本の都市 */}
            {filteredJapanCities.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  日本
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {filteredJapanCities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleAddPreset(city)}
                      disabled={locations.some(loc => loc.id === city.id)}
                      className="px-3 py-2 text-sm text-left rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <p className="font-medium text-gray-800 dark:text-gray-100">{city.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{city.prefecture}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 世界の都市 */}
            {filteredWorldCities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  世界
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {filteredWorldCities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleAddPreset(city)}
                      disabled={locations.some(loc => loc.id === city.id)}
                      className="px-3 py-2 text-sm text-left rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <p className="font-medium text-gray-800 dark:text-gray-100">{city.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{city.country}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && filteredJapanCities.length === 0 && filteredWorldCities.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                該当する都市が見つかりません
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
