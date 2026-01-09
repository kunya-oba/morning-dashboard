/**
 * 更新間隔の定数定義
 * 各APIの更新頻度を一元管理
 */

export const INTERVALS = {
  WEATHER_UPDATE: 10 * 60 * 1000,      // 10分 (天気情報)
  TRAIN_STATUS_UPDATE: 5 * 60 * 1000,  // 5分 (運行情報)
  NEWS_UPDATE: 15 * 60 * 1000,         // 15分 (ニュース)
  QUOTE_UPDATE: 30 * 60 * 1000,        // 30分 (名言)
  ANNIVERSARY_UPDATE: 60 * 60 * 1000,  // 60分 (記念日)
} as const
