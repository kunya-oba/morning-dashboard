import { useEffect, useState } from 'react'
import { Clock, Play, Pause, RotateCcw, Coffee, Briefcase, Settings, X } from 'lucide-react'
import { logger } from '../utils/logger'

type TimerMode = 'work' | 'break' | 'idle'

interface TimerSettings {
  workMinutes: number
  breakMinutes: number
  autoStart: boolean
}

export default function ClockTimerCard() {
  // 現在時刻
  const [currentTime, setCurrentTime] = useState(new Date())

  // タイマー設定
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem('pomodoroSettings')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        logger.error('タイマー設定の復元に失敗:', e)
      }
    }
    return {
      workMinutes: 25,
      breakMinutes: 5,
      autoStart: false
    }
  })

  // タイマー状態
  const [mode, setMode] = useState<TimerMode>('idle')
  const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [completedSessions, setCompletedSessions] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  // 設定を一時保存
  const [tempSettings, setTempSettings] = useState(settings)

  // 現在時刻の更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 設定をLocalStorageに保存
  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings))
  }, [settings])

  // タイマーのカウントダウン
  useEffect(() => {
    if (!isRunning) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // タイマー完了
          handleTimerComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning])

  const handleTimerComplete = () => {
    setIsRunning(false)

    // 通知を送信（許可されている場合）
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = mode === 'work' ? '作業時間終了！' : '休憩時間終了！'
      const body = mode === 'work'
        ? '休憩時間です。リフレッシュしましょう。'
        : '作業時間です。集中しましょう！'

      new Notification(title, {
        body,
        icon: '/favicon.ico'
      })
    }

    // 音声通知（オプション）
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuBzvLaiTkIGWi77eeeTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUgND1as5++wXRgIPpbb8sZzKQUrgc7y2ok5CBlouy3nmkwPDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBAChRetOvrqFUUCkaf4PK+bCEFMYfR89OCMwYebsDv45lIDQ9WrOfvsFwXCD6W2/LGcykFK4HO8tqJOQgZaLst55pMDwxQp+PwtmMcBjiS1/LMeSwFJHfH8N2QQAoUXrTr66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BcFwg+ltryxnMpBSuBzvLaiTkIGWi7LeeaTA8MUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUgND1as5++wXBcIPpbb8sZzKQUrgc7y2ok5CBlou')
      audio.play().catch(e => logger.error('音声再生エラー:', e))
    } catch (e) {
      logger.error('音声再生エラー:', e)
    }

    if (mode === 'work') {
      // 作業完了 → 休憩へ
      setCompletedSessions(prev => prev + 1)
      setMode('break')
      setTimeLeft(settings.breakMinutes * 60)

      if (settings.autoStart) {
        setIsRunning(true)
      }
    } else {
      // 休憩完了 → 作業へ
      setMode('work')
      setTimeLeft(settings.workMinutes * 60)

      if (settings.autoStart) {
        setIsRunning(true)
      }
    }
  }

  const handleStart = () => {
    if (mode === 'idle') {
      setMode('work')
      setTimeLeft(settings.workMinutes * 60)
    }
    setIsRunning(true)

    // 通知許可をリクエスト
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setMode('idle')
    setTimeLeft(settings.workMinutes * 60)
  }

  const handleSaveSettings = () => {
    setSettings(tempSettings)
    setShowSettings(false)

    // タイマーをリセット
    if (mode === 'work') {
      setTimeLeft(tempSettings.workMinutes * 60)
    } else if (mode === 'break') {
      setTimeLeft(tempSettings.breakMinutes * 60)
    }
  }

  // 時間をフォーマット (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 進捗率を計算
  const getProgress = (): number => {
    const total = mode === 'work'
      ? settings.workMinutes * 60
      : settings.breakMinutes * 60
    return ((total - timeLeft) / total) * 100
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Clock className="w-7 h-7 text-blue-500" />
          時計・タイマー
        </h2>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="設定"
        >
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* 現在時刻 */}
      <div className="text-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="text-5xl font-bold font-mono text-gray-800 dark:text-gray-100 mb-2">
          {currentTime.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {currentTime.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </div>
      </div>

      {/* 設定パネル */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              タイマー設定
            </h3>
            <button
              onClick={() => {
                setShowSettings(false)
                setTempSettings(settings)
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              作業時間（分）
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={tempSettings.workMinutes}
              onChange={(e) => setTempSettings({ ...tempSettings, workMinutes: parseInt(e.target.value) || 25 })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
              休憩時間（分）
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={tempSettings.breakMinutes}
              onChange={(e) => setTempSettings({ ...tempSettings, breakMinutes: parseInt(e.target.value) || 5 })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              自動開始
            </label>
            <button
              onClick={() => setTempSettings({ ...tempSettings, autoStart: !tempSettings.autoStart })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                tempSettings.autoStart ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  tempSettings.autoStart ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            設定を保存
          </button>
        </div>
      )}

      {/* ポモドーロタイマー */}
      <div className="space-y-4">
        {/* モード表示 */}
        <div className="flex items-center justify-center gap-2">
          {mode === 'work' ? (
            <>
              <Briefcase className="w-5 h-5 text-blue-500" />
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">作業時間</span>
            </>
          ) : mode === 'break' ? (
            <>
              <Coffee className="w-5 h-5 text-green-500" />
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">休憩時間</span>
            </>
          ) : (
            <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">待機中</span>
          )}
        </div>

        {/* タイマー表示 */}
        <div className="relative">
          {/* 円形プログレスバー */}
          <svg className="w-full h-48" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={mode === 'work' ? 'text-blue-500' : mode === 'break' ? 'text-green-500' : 'text-gray-400'}
              strokeDasharray={`${2 * Math.PI * 80}`}
              strokeDashoffset={`${2 * Math.PI * 80 * (1 - getProgress() / 100)}`}
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>

          {/* 残り時間 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold font-mono text-gray-800 dark:text-gray-100">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {mode === 'idle' ? 'スタートしてください' : isRunning ? '実行中' : '一時停止'}
              </div>
            </div>
          </div>
        </div>

        {/* コントロールボタン */}
        <div className="flex items-center justify-center gap-4">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors shadow-lg"
            >
              <Play className="w-5 h-5" />
              スタート
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors shadow-lg"
            >
              <Pause className="w-5 h-5" />
              一時停止
            </button>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors shadow-lg"
          >
            <RotateCcw className="w-5 h-5" />
            リセット
          </button>
        </div>

        {/* 完了セッション数 */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
          完了セッション: <span className="font-semibold text-blue-500">{completedSessions}</span>
        </div>
      </div>
    </div>
  )
}
