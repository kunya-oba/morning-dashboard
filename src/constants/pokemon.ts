/**
 * ポケモン関連の定数
 */

export const POKEMON_CONFIG = {
  MIN_ID: 1,
  MAX_ID: 1010, // 第9世代までのポケモン数（定期的に更新が必要）
} as const

/**
 * ランダムなポケモンIDを生成
 * @returns MIN_IDからMAX_IDの範囲のランダムな整数
 */
export function getRandomPokemonId(): number {
  return Math.floor(
    Math.random() * (POKEMON_CONFIG.MAX_ID - POKEMON_CONFIG.MIN_ID + 1)
  ) + POKEMON_CONFIG.MIN_ID
}
