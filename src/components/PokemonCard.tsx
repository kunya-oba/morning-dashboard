import { useEffect, useState } from 'react'
import { Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { logger } from '../utils/logger'
import { PokemonData, StoredPokemon, PokeApiPokemon, PokeApiSpecies, TYPE_NAMES_JA, TYPE_COLORS } from '../types/pokemon'
import { getRandomPokemonId } from '../constants/pokemon'

export default function PokemonCard() {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTodaysPokemon()
  }, [])

  const getTodaysDate = (): string => {
    const today = new Date()
    return today.toISOString().split('T')[0] // YYYY-MM-DD
  }

  const fetchTodaysPokemon = async () => {
    try {
      setLoading(true)
      setError(null)

      const today = getTodaysDate()
      const stored = localStorage.getItem('todaysPokemon')

      // LocalStorageに今日のポケモンがあればそれを使用
      if (stored) {
        const data: StoredPokemon = JSON.parse(stored)
        if (data.date === today) {
          logger.log('今日のポケモンをLocalStorageから取得:', data.pokemon.japaneseName)
          setPokemon(data.pokemon)
          setLoading(false)
          return
        }
      }

      // 新しいランダムポケモンを取得
      await fetchRandomPokemon(today)
    } catch (err) {
      logger.error('ポケモンの取得に失敗:', err)
      setError('ポケモンを取得できませんでした')
      setLoading(false)
    }
  }

  const fetchRandomPokemon = async (date: string) => {
    try {
      // ランダムなポケモンIDを生成
      const randomId = getRandomPokemonId()
      logger.log(`ランダムポケモンID: ${randomId}`)

      // ポケモン基本情報を取得
      const pokemonResponse = await axios.get<PokeApiPokemon>(
        `https://pokeapi.co/api/v2/pokemon/${randomId}`,
        { timeout: 10000 }
      )

      // ポケモン種族情報を取得（日本語名のため）
      const speciesResponse = await axios.get<PokeApiSpecies>(
        `https://pokeapi.co/api/v2/pokemon-species/${randomId}`,
        { timeout: 10000 }
      )

      const pokemonData = pokemonResponse.data
      const speciesData = speciesResponse.data

      // 日本語名を取得（ja-Hrktを優先、次にja、最後にフォールバック）
      const japaneseName =
        speciesData.names.find(name => name.language.name === 'ja-Hrkt')?.name ||
        speciesData.names.find(name => name.language.name === 'ja')?.name ||
        pokemonData.name

      // タイプを取得
      const types = pokemonData.types.map((t) => t.type.name)

      // 画像URLを取得（高画質版）
      const sprite =
        pokemonData.sprites.other['official-artwork'].front_default ||
        pokemonData.sprites.front_default

      const newPokemon: PokemonData = {
        id: pokemonData.id,
        name: pokemonData.name,
        japaneseName,
        sprite,
        types,
        height: pokemonData.height,
        weight: pokemonData.weight
      }

      // LocalStorageに保存
      const storedData: StoredPokemon = {
        date,
        pokemon: newPokemon
      }
      localStorage.setItem('todaysPokemon', JSON.stringify(storedData))

      logger.log('新しいポケモンを取得:', japaneseName)
      setPokemon(newPokemon)
      setLoading(false)
    } catch (err) {
      logger.error('ポケモンデータの取得に失敗:', err)
      throw err
    }
  }

  const handleRefresh = () => {
    const today = getTodaysDate()
    fetchRandomPokemon(today)
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
        <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-yellow-500" />
          今日のポケモン
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
        </div>
      </div>
    )
  }

  if (error || !pokemon) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
        <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-yellow-500" />
          今日のポケモン
        </h2>
        <div className="flex flex-col items-center justify-center py-12 text-red-600 dark:text-red-400">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p>{error || 'ポケモンを読み込めませんでした'}</p>
          <button
            onClick={fetchTodaysPokemon}
            className="mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-display font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-yellow-500" />
          今日のポケモン
        </h2>

        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="別のポケモンを表示"
          title="別のポケモンを表示"
        >
          <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="flex flex-col items-center">
        {/* ポケモン画像 */}
        <div className="relative mb-4">
          <div className="w-48 h-48 flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-2xl">
            <img
              src={pokemon.sprite}
              alt={pokemon.japaneseName}
              className="w-full h-full object-contain p-4"
              loading="lazy"
            />
          </div>
          <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
            No.{pokemon.id.toString().padStart(3, '0')}
          </div>
        </div>

        {/* ポケモン名 */}
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">
          {pokemon.japaneseName}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 capitalize">
          {pokemon.name}
        </p>

        {/* タイプ */}
        <div className="flex gap-2 mb-6">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className="px-4 py-1.5 rounded-full text-white text-sm font-semibold shadow-md"
              style={{ backgroundColor: TYPE_COLORS[type] || '#777' }}
            >
              {TYPE_NAMES_JA[type] || type}
            </span>
          ))}
        </div>

        {/* 詳細情報 */}
        <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">高さ</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {(pokemon.height / 10).toFixed(1)}m
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">重さ</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {(pokemon.weight / 10).toFixed(1)}kg
            </p>
          </div>
        </div>

        {/* 説明文 */}
        <div className="w-full mt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            今日のポケモンは {pokemon.japaneseName} です！
          </p>
        </div>
      </div>
    </div>
  )
}
