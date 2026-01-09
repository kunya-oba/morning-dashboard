/**
 * ルーティン項目の型定義
 */
export interface RoutineItem {
  id: string
  title: string
  icon: string
  order: number
  estimatedMinutes: number
  enabled: boolean
}

/**
 * 日次進捗の型定義
 */
export interface DailyProgress {
  date: string // YYYY-MM-DD形式
  completedItems: string[] // 完了した項目のIDリスト
  completedAt?: string // 全て完了した時刻（ISO 8601形式）
  timestamps: Record<string, string> // 各項目の完了時刻
}

/**
 * ストリーク情報の型定義
 */
export interface StreakInfo {
  current: number // 現在の連続達成日数
  longest: number // 最長連続達成日数
  lastCompletedDate: string // 最後に完了した日付
}

/**
 * デフォルトのルーティン項目
 */
export const DEFAULT_ROUTINE_ITEMS: RoutineItem[] = [
  { id: '1', title: '起床', icon: '🌅', order: 1, estimatedMinutes: 0, enabled: true },
  { id: '2', title: '歯磨き', icon: '🪥', order: 2, estimatedMinutes: 3, enabled: true },
  { id: '3', title: '洗顔', icon: '🧼', order: 3, estimatedMinutes: 2, enabled: true },
  { id: '4', title: 'ストレッチ', icon: '🧘', order: 4, estimatedMinutes: 5, enabled: true },
  { id: '5', title: '朝食', icon: '🍽️', order: 5, estimatedMinutes: 15, enabled: true },
  { id: '6', title: '着替え', icon: '👔', order: 6, estimatedMinutes: 5, enabled: true },
  { id: '7', title: '持ち物確認', icon: '🎒', order: 7, estimatedMinutes: 3, enabled: true },
  { id: '8', title: '出発準備', icon: '🚪', order: 8, estimatedMinutes: 2, enabled: true },
]

/**
 * ルーティンテンプレート
 */
export const ROUTINE_TEMPLATES = {
  minimal: [
    { id: '1', title: '起床', icon: '🌅', order: 1, estimatedMinutes: 0, enabled: true },
    { id: '2', title: '歯磨き', icon: '🪥', order: 2, estimatedMinutes: 3, enabled: true },
    { id: '3', title: '着替え', icon: '👔', order: 3, estimatedMinutes: 5, enabled: true },
  ],
  standard: DEFAULT_ROUTINE_ITEMS,
  full: [
    { id: '1', title: '起床', icon: '🌅', order: 1, estimatedMinutes: 0, enabled: true },
    { id: '2', title: '水を飲む', icon: '💧', order: 2, estimatedMinutes: 1, enabled: true },
    { id: '3', title: '歯磨き', icon: '🪥', order: 3, estimatedMinutes: 3, enabled: true },
    { id: '4', title: '洗顔', icon: '🧼', order: 4, estimatedMinutes: 2, enabled: true },
    { id: '5', title: 'ストレッチ', icon: '🧘', order: 5, estimatedMinutes: 10, enabled: true },
    { id: '6', title: 'シャワー', icon: '🚿', order: 6, estimatedMinutes: 10, enabled: true },
    { id: '7', title: '朝食', icon: '🍽️', order: 7, estimatedMinutes: 20, enabled: true },
    { id: '8', title: '着替え', icon: '👔', order: 8, estimatedMinutes: 5, enabled: true },
    { id: '9', title: '瞑想', icon: '🧘‍♂️', order: 9, estimatedMinutes: 5, enabled: true },
    { id: '10', title: '持ち物確認', icon: '🎒', order: 10, estimatedMinutes: 3, enabled: true },
    { id: '11', title: '出発準備', icon: '🚪', order: 11, estimatedMinutes: 2, enabled: true },
  ],
}
