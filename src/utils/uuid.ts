/**
 * UUID生成ユーティリティ
 * ブラウザ互換性を考慮したID生成関数
 */

/**
 * ユニークなIDを生成
 * crypto.randomUUID()が利用可能な場合はそれを使用し、
 * 利用できない場合はフォールバックとして独自実装を使用
 *
 * @returns ユニークなID文字列
 */
export function generateId(): string {
  // crypto.randomUUID()が利用可能かチェック
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // フォールバック: タイムスタンプ + ランダム文字列
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
