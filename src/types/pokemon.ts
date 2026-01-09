/**
 * PokeAPI関連の型定義
 */

export interface PokemonData {
  id: number
  name: string
  japaneseName: string
  sprite: string
  types: string[]
  height: number
  weight: number
}

export interface StoredPokemon {
  date: string // YYYY-MM-DD形式
  pokemon: PokemonData
}

// PokeAPI レスポンス型
export interface PokeApiPokemon {
  id: number
  name: string
  height: number
  weight: number
  sprites: {
    front_default: string
    other: {
      'official-artwork': {
        front_default: string
      }
    }
  }
  types: Array<{
    type: {
      name: string
    }
  }>
}

export interface PokeApiSpecies {
  names: Array<{
    language: {
      name: string
    }
    name: string
  }>
}

// タイプの日本語名マッピング
export const TYPE_NAMES_JA: Record<string, string> = {
  normal: 'ノーマル',
  fire: 'ほのお',
  water: 'みず',
  electric: 'でんき',
  grass: 'くさ',
  ice: 'こおり',
  fighting: 'かくとう',
  poison: 'どく',
  ground: 'じめん',
  flying: 'ひこう',
  psychic: 'エスパー',
  bug: 'むし',
  rock: 'いわ',
  ghost: 'ゴースト',
  dragon: 'ドラゴン',
  dark: 'あく',
  steel: 'はがね',
  fairy: 'フェアリー'
}

// タイプの色マッピング
export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
}
