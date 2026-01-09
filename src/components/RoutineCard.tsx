import { useState, useEffect } from 'react'
import { ListChecks, CheckCircle, Settings, RotateCcw, TrendingUp, Flame } from 'lucide-react'
import { DEFAULT_ROUTINE_ITEMS, ROUTINE_TEMPLATES } from '../types/routine'
import type { RoutineItem, DailyProgress, StreakInfo } from '../types/routine'

export default function RoutineCard() {
  const today = new Date().toISOString().split('T')[0]

  // ルーティン項目の管理
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>(() => {
    const saved = localStorage.getItem('routineItems')
    return saved ? JSON.parse(saved) : DEFAULT_ROUTINE_ITEMS
  })

  // 今日の進捗管理
  const [todayProgress, setTodayProgress] = useState<DailyProgress>(() => {
    const saved = localStorage.getItem(`routine-${today}`)
    if (saved) {
      return JSON.parse(saved)
    }
    return { date: today, completedItems: [], timestamps: {} }
  })

  // ストリーク情報の管理
  const [streakInfo, setStreakInfo] = useState<StreakInfo>(() => {
    const saved = localStorage.getItem('routineStreak')
    return saved ? JSON.parse(saved) : { current: 0, longest: 0, lastCompletedDate: '' }
  })

  // 設定モード
  const [showSettings, setShowSettings] = useState(false)

  // 有効な項目のみをフィルタ
  const enabledItems = routineItems.filter(item => item.enabled)

  // 完了率の計算
  const completionRate = enabledItems.length > 0
    ? (todayProgress.completedItems.length / enabledItems.length) * 100
    : 0

  // 推定残り時間の計算
  const estimatedRemainingTime = enabledItems
    .filter(item => !todayProgress.completedItems.includes(item.id))
    .reduce((sum, item) => sum + item.estimatedMinutes, 0)

  // 項目のトグル
  const toggleItem = (itemId: string) => {
    const isCompleted = todayProgress.completedItems.includes(itemId)
    const newCompletedItems = isCompleted
      ? todayProgress.completedItems.filter(id => id !== itemId)
      : [...todayProgress.completedItems, itemId]

    const newTimestamps = { ...todayProgress.timestamps }
    if (isCompleted) {
      delete newTimestamps[itemId]
    } else {
      newTimestamps[itemId] = new Date().toISOString()
    }

    const newProgress: DailyProgress = {
      date: today,
      completedItems: newCompletedItems,
      timestamps: newTimestamps,
    }

    // 全て完了した場合
    if (newCompletedItems.length === enabledItems.length && enabledItems.length > 0) {
      newProgress.completedAt = new Date().toISOString()
      updateStreak()
    }

    setTodayProgress(newProgress)
    localStorage.setItem(`routine-${today}`, JSON.stringify(newProgress))
  }

  // ストリークの更新
  const updateStreak = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let newCurrent = 1
    if (streakInfo.lastCompletedDate === yesterdayStr) {
      newCurrent = streakInfo.current + 1
    } else if (streakInfo.lastCompletedDate !== today) {
      newCurrent = 1
    } else {
      newCurrent = streakInfo.current
    }

    const newLongest = Math.max(newCurrent, streakInfo.longest)

    const newStreakInfo: StreakInfo = {
      current: newCurrent,
      longest: newLongest,
      lastCompletedDate: today,
    }

    setStreakInfo(newStreakInfo)
    localStorage.setItem('routineStreak', JSON.stringify(newStreakInfo))
  }

  // リセット
  const resetToday = () => {
    if (window.confirm('今日の進捗をリセットしますか？')) {
      const newProgress: DailyProgress = {
        date: today,
        completedItems: [],
        timestamps: {},
      }
      setTodayProgress(newProgress)
      localStorage.setItem(`routine-${today}`, JSON.stringify(newProgress))
    }
  }

  // テンプレート適用
  const applyTemplate = (templateKey: keyof typeof ROUTINE_TEMPLATES) => {
    const template = ROUTINE_TEMPLATES[templateKey]
    setRoutineItems(template)
    localStorage.setItem('routineItems', JSON.stringify(template))
    setShowSettings(false)
  }

  // 項目の有効/無効切り替え
  const toggleItemEnabled = (itemId: string) => {
    const newItems = routineItems.map(item =>
      item.id === itemId ? { ...item, enabled: !item.enabled } : item
    )
    setRoutineItems(newItems)
    localStorage.setItem('routineItems', JSON.stringify(newItems))
  }

  // 完了時刻のフォーマット
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  // 日付が変わったら自動でリセット
  useEffect(() => {
    const checkDate = () => {
      const currentDate = new Date().toISOString().split('T')[0]
      if (currentDate !== todayProgress.date) {
        const newProgress: DailyProgress = {
          date: currentDate,
          completedItems: [],
          timestamps: {},
        }
        setTodayProgress(newProgress)
        localStorage.setItem(`routine-${currentDate}`, JSON.stringify(newProgress))
      }
    }

    // 1分ごとにチェック
    const interval = setInterval(checkDate, 60000)
    return () => clearInterval(interval)
  }, [todayProgress.date])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <ListChecks className="w-7 h-7 text-orange-500" />
          モーニングルーティン
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="設定"
          >
            <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={resetToday}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="リセット"
          >
            <RotateCcw className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* 設定パネル */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              テンプレート
            </h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => applyTemplate('minimal')}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                ミニマル (3項目)
              </button>
              <button
                onClick={() => applyTemplate('standard')}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                スタンダード (8項目)
              </button>
              <button
                onClick={() => applyTemplate('full')}
                className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
              >
                フルコース (11項目)
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              項目の有効/無効
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {routineItems.map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={() => toggleItemEnabled(item.id)}
                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 進捗バー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">進捗</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
              {Math.round(completionRate)}%
            </span>
            {estimatedRemainingTime > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                残り約{estimatedRemainingTime}分
              </span>
            )}
          </div>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 ease-out"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* ストリーク表示 */}
      {streakInfo.current > 0 && (
        <div className="mb-6 flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-semibold text-orange-800 dark:text-orange-300">
              連続達成: {streakInfo.current}日間
            </span>
          </div>
          {streakInfo.longest > streakInfo.current && (
            <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              <TrendingUp className="w-4 h-4" />
              最長: {streakInfo.longest}日
            </div>
          )}
        </div>
      )}

      {/* チェックリスト */}
      <div className="space-y-2">
        {enabledItems.map((item) => {
          const isCompleted = todayProgress.completedItems.includes(item.id)
          const completedTime = todayProgress.timestamps[item.id]

          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                isCompleted
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 scale-[0.98]'
                  : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1 text-left">
                <p
                  className={`font-medium transition-all ${
                    isCompleted
                      ? 'line-through text-gray-500 dark:text-gray-400'
                      : 'text-gray-800 dark:text-gray-100'
                  }`}
                >
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {isCompleted && completedTime ? (
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      {formatTime(completedTime)}に完了
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      約{item.estimatedMinutes}分
                    </p>
                  )}
                </div>
              </div>
              {isCompleted && (
                <CheckCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      {/* 完了メッセージ */}
      {completionRate === 100 && enabledItems.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white text-center animate-bounce-once">
          <p className="text-lg font-bold">🎉 素晴らしい！</p>
          <p className="text-sm mt-1">すべてのルーティンが完了しました</p>
          {todayProgress.completedAt && (
            <p className="text-xs mt-2 opacity-90">
              完了時刻: {formatTime(todayProgress.completedAt)}
            </p>
          )}
        </div>
      )}

      {/* フッター */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          完了: {todayProgress.completedItems.length} / {enabledItems.length}
        </p>
      </div>
    </div>
  )
}
