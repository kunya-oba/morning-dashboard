/**
 * 日付フォーマット用のユーティリティ関数
 * 日本語表記の日付フォーマットを提供
 */

/**
 * 相対時刻を日本語でフォーマット
 * 例: "5分前", "2時間前", "1月5日 10:30"
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}分前`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours}時間前`
    }

    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}

/**
 * 日付を日本語でフォーマット
 * 例: "2026年1月9日(木)"
 */
export const formatJapaneseDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

/**
 * 日付を曜日付きで短縮フォーマット
 * 例: "1月9日(木)"
 */
export const formatShortDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  })
}
