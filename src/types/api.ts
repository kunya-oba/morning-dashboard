/**
 * API型定義
 * 各APIの応答型を定義し、型安全性を向上
 */

// Open-Meteo API
export interface OpenMeteoResponse {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    precipitation: number
    weather_code: number
    wind_speed_10m: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
  }
}

// ZenQuotes API
export interface ZenQuote {
  q: string // quote text
  a: string // author
  h: string // html formatted quote
}

// MyMemory Translation API
export interface MyMemoryTranslationResponse {
  responseData: {
    translatedText: string
  }
  responseStatus: number
}

// AllOrigins CORS Proxy
export interface AllOriginsResponse {
  contents: string
  status: {
    url: string
    content_type: string
    http_code: number
    response_time: number
  }
}

// Unsplash API
export interface UnsplashPhotoResponse {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  user: {
    name: string
    username: string
  }
  description?: string
  alt_description?: string
}

// Wikipedia API
export interface WikipediaParseResponse {
  parse: {
    title: string
    pageid: number
    text: {
      '*': string
    }
  }
}
