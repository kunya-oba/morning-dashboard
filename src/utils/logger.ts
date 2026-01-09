/**
 * 開発用ロガーユーティリティ
 * 本番環境では不要なログ出力を防ぐ
 */

const isDev = import.meta.env.DEV

export const logger = {
  log: (...args: unknown[]) => isDev && console.log(...args),
  warn: (...args: unknown[]) => isDev && console.warn(...args),
  error: (...args: unknown[]) => console.error(...args), // エラーは常に出力
}
