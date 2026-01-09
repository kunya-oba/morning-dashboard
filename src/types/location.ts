/**
 * 位置情報関連の型定義
 */

export interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  country?: string
  isCurrentLocation?: boolean
}

export interface LocationPreset {
  id: string
  name: string
  nameEn: string
  latitude: number
  longitude: number
  country: string
  prefecture?: string
}

// 日本の主要都市プリセット
export const JAPAN_CITIES: LocationPreset[] = [
  { id: 'tokyo', name: '東京', nameEn: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: '日本', prefecture: '東京都' },
  { id: 'osaka', name: '大阪', nameEn: 'Osaka', latitude: 34.6937, longitude: 135.5023, country: '日本', prefecture: '大阪府' },
  { id: 'nagoya', name: '名古屋', nameEn: 'Nagoya', latitude: 35.1815, longitude: 136.9066, country: '日本', prefecture: '愛知県' },
  { id: 'sapporo', name: '札幌', nameEn: 'Sapporo', latitude: 43.0642, longitude: 141.3469, country: '日本', prefecture: '北海道' },
  { id: 'fukuoka', name: '福岡', nameEn: 'Fukuoka', latitude: 33.5904, longitude: 130.4017, country: '日本', prefecture: '福岡県' },
  { id: 'yokohama', name: '横浜', nameEn: 'Yokohama', latitude: 35.4437, longitude: 139.6380, country: '日本', prefecture: '神奈川県' },
  { id: 'kobe', name: '神戸', nameEn: 'Kobe', latitude: 34.6901, longitude: 135.1955, country: '日本', prefecture: '兵庫県' },
  { id: 'kyoto', name: '京都', nameEn: 'Kyoto', latitude: 35.0116, longitude: 135.7681, country: '日本', prefecture: '京都府' },
  { id: 'sendai', name: '仙台', nameEn: 'Sendai', latitude: 38.2682, longitude: 140.8694, country: '日本', prefecture: '宮城県' },
  { id: 'hiroshima', name: '広島', nameEn: 'Hiroshima', latitude: 34.3853, longitude: 132.4553, country: '日本', prefecture: '広島県' },
  { id: 'niigata', name: '新潟', nameEn: 'Niigata', latitude: 37.9161, longitude: 139.0364, country: '日本', prefecture: '新潟県' },
  { id: 'okinawa', name: '那覇', nameEn: 'Naha', latitude: 26.2124, longitude: 127.6809, country: '日本', prefecture: '沖縄県' },
]

// 世界の主要都市プリセット
export const WORLD_CITIES: LocationPreset[] = [
  { id: 'newyork', name: 'ニューヨーク', nameEn: 'New York', latitude: 40.7128, longitude: -74.0060, country: 'アメリカ' },
  { id: 'london', name: 'ロンドン', nameEn: 'London', latitude: 51.5074, longitude: -0.1278, country: 'イギリス' },
  { id: 'paris', name: 'パリ', nameEn: 'Paris', latitude: 48.8566, longitude: 2.3522, country: 'フランス' },
  { id: 'singapore', name: 'シンガポール', nameEn: 'Singapore', latitude: 1.3521, longitude: 103.8198, country: 'シンガポール' },
  { id: 'shanghai', name: '上海', nameEn: 'Shanghai', latitude: 31.2304, longitude: 121.4737, country: '中国' },
  { id: 'seoul', name: 'ソウル', nameEn: 'Seoul', latitude: 37.5665, longitude: 126.9780, country: '韓国' },
  { id: 'sydney', name: 'シドニー', nameEn: 'Sydney', latitude: -33.8688, longitude: 151.2093, country: 'オーストラリア' },
]

export const ALL_CITY_PRESETS = [...JAPAN_CITIES, ...WORLD_CITIES]
