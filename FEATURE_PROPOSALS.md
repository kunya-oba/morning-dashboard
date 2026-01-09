# 機能追加提案: morning-dashboard

提案日: 2026-01-09

---

## 提案の方針

朝のダッシュボードとして、以下の観点から機能を提案します：

1. **朝の効率化**: 朝の準備や出勤をスムーズにする
2. **情報の一元化**: 朝に必要な情報を1箇所で確認できる
3. **モチベーション向上**: 気持ちよく1日をスタートできる
4. **パーソナライゼーション**: ユーザーごとにカスタマイズ可能

---

## 🌟 優先度: 高（すぐに実装すべき）

### 1. TODOリスト / タスク管理カード

**概要**:
今日やるべきタスクを管理できるシンプルなTODOリストカード

**機能詳細**:
- タスクの追加・編集・削除
- チェックボックスで完了管理
- LocalStorageで永続化
- ドラッグ&ドロップで並び替え
- 優先度の設定（高・中・低）
- 期限の設定と期限切れのハイライト
- 完了タスクの表示/非表示切り替え

**実装の難易度**: ⭐⭐ (低)

**価値**:
- 朝、今日やるべきことを確認できる
- ダッシュボード内で完結するため、別アプリを開く必要がない
- モチベーション向上（タスク完了の達成感）

**実装例**:
```typescript
interface Task {
  id: string
  title: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  createdAt: string
}

// components/TodoCard.tsx
export default function TodoCard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const addTask = () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      completed: false,
      priority: 'medium',
      createdAt: new Date().toISOString()
    }
    setTasks([...tasks, newTask])
    setNewTaskTitle('')
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-display font-semibold mb-6">
        <CheckSquare className="w-7 h-7 text-green-500" />
        今日のタスク
      </h2>

      {/* タスク追加フォーム */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="新しいタスクを追加..."
          className="flex-1 px-4 py-2 rounded-lg border"
        />
        <button onClick={addTask} className="px-4 py-2 bg-green-500 text-white rounded-lg">
          追加
        </button>
      </div>

      {/* タスクリスト */}
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="w-5 h-5"
            />
            <span className={task.completed ? 'line-through text-gray-400' : ''}>
              {task.title}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        完了: {tasks.filter(t => t.completed).length} / {tasks.length}
      </div>
    </div>
  )
}
```

---

### 2. 複数路線の運行情報対応

**概要**:
現在は都営浅草線のみだが、ユーザーが利用する複数の路線を登録・表示できる

**機能詳細**:
- 路線の追加・削除（設定パネル）
- 複数路線の運行情報を同時表示
- 路線ごとの遅延状況を色分け表示
- よく使う路線をプリセットとして提供
  - JR山手線、JR中央線、東京メトロ各線、私鉄主要路線など

**実装の難易度**: ⭐⭐⭐ (中)

**価値**:
- 多くのユーザーは複数路線を使う
- 乗り換え情報も一目で確認できる
- より実用的なダッシュボードになる

**実装例**:
```typescript
interface RailwayLine {
  id: string
  name: string
  operator: string
  statusUrl: string
  color: string
}

const PRESET_LINES: RailwayLine[] = [
  {
    id: 'toei-asakusa',
    name: '浅草線',
    operator: '都営地下鉄',
    statusUrl: 'https://www.kotsu.metro.tokyo.jp/subway/schedule/asakusa.html',
    color: '#E85298'
  },
  {
    id: 'jr-yamanote',
    name: '山手線',
    operator: 'JR東日本',
    statusUrl: 'https://traininfo.jreast.co.jp/train_info/line.aspx',
    color: '#9ACD32'
  },
  // ... 他の路線
]

// components/TrainStatusCard.tsx（改良版）
export default function TrainStatusCard() {
  const [selectedLines, setSelectedLines] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedLines')
    return saved ? JSON.parse(saved) : ['toei-asakusa']
  })

  const [statuses, setStatuses] = useState<Map<string, TrainStatus>>(new Map())

  // 各路線の運行情報を取得
  useEffect(() => {
    selectedLines.forEach(lineId => {
      const line = PRESET_LINES.find(l => l.id === lineId)
      if (line) {
        fetchTrainStatus(line).then(status => {
          setStatuses(prev => new Map(prev).set(lineId, status))
        })
      }
    })
  }, [selectedLines])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-semibold">
          <Train className="w-7 h-7 text-pink-500" />
          運行情報
        </h2>
        <button onClick={() => setShowSettings(true)} className="...">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {selectedLines.map(lineId => {
          const line = PRESET_LINES.find(l => l.id === lineId)
          const status = statuses.get(lineId)

          return (
            <div key={lineId} className="border-l-4 pl-4" style={{ borderColor: line?.color }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{line?.name}</p>
                  <p className="text-sm text-gray-500">{line?.operator}</p>
                </div>
                <StatusBadge status={status?.status} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

---

### 3. 時計・タイマーカード

**概要**:
現在時刻の大きな表示、アラーム、ポモドーロタイマー機能

**機能詳細**:
- リアルタイムの時計表示（秒針付き）
- アナログ/デジタル切り替え
- タイムゾーン表示（海外とのミーティングに便利）
- カウントダウンタイマー
- ポモドーロタイマー（25分作業 + 5分休憩）
- アラーム機能（ブラウザ通知）

**実装の難易度**: ⭐⭐ (低)

**価値**:
- 朝の時間管理に役立つ
- 出発時間のリマインダーとして機能
- 作業の集中力向上（ポモドーロ）

**実装例**:
```typescript
// components/ClockCard.tsx
export default function ClockCard() {
  const [time, setTime] = useState(new Date())
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isTimerRunning || remainingSeconds === 0) return

    const interval = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          // タイマー終了
          new Notification('タイマー終了！', {
            body: '設定した時間が経過しました',
            icon: '/icon.png'
          })
          setIsTimerRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isTimerRunning, remainingSeconds])

  const startTimer = () => {
    setRemainingSeconds(timerMinutes * 60)
    setIsTimerRunning(true)

    // 通知の許可をリクエスト
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-display font-semibold mb-6">
        <Clock className="w-7 h-7 text-blue-500" />
        時計・タイマー
      </h2>

      {/* 現在時刻 */}
      <div className="text-center mb-8">
        <p className="text-6xl font-bold text-gray-800 dark:text-gray-100 font-mono">
          {time.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="text-2xl text-gray-500 dark:text-gray-400 font-mono mt-2">
          :{time.getSeconds().toString().padStart(2, '0')}
        </p>
      </div>

      {/* タイマー */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4">タイマー</h3>

        {!isTimerRunning ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(Number(e.target.value))}
                min="1"
                max="60"
                className="w-20 px-3 py-2 border rounded-lg"
              />
              <span className="text-gray-600 dark:text-gray-400">分</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={startTimer}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                スタート
              </button>
              <button
                onClick={() => setTimerMinutes(25)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                ポモドーロ
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-4xl font-mono text-center text-blue-600 dark:text-blue-400">
              {formatTime(remainingSeconds)}
            </p>
            <button
              onClick={() => setIsTimerRunning(false)}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              停止
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 🎯 優先度: 中（次のバージョンで実装）

### 4. カレンダー・スケジュール統合

**概要**:
Google Calendar、Outlook、iCloudなどと連携し、今日・今週の予定を表示

**機能詳細**:
- OAuth認証でカレンダーAPI連携
- 今日の予定を時系列で表示
- 次の予定までの時間をカウントダウン
- 予定の色分け表示（仕事/プライベート）
- 会議リンク（Zoom、Google Meet）へのクイックアクセス

**実装の難易度**: ⭐⭐⭐⭐ (高)

**価値**:
- 朝、今日の予定を一目で確認できる
- 準備時間の計算に役立つ
- 遅刻防止

**技術的な考慮事項**:
- OAuth認証の実装が必要
- APIキーの管理
- プライバシーへの配慮

---

### 5. 天気アラート・通知機能

**概要**:
雨予報、気温の急変、台風情報などをプッシュ通知

**機能詳細**:
- 今日の降水確率が高い場合、朝に通知
- 気温が極端に高い/低い場合の警告
- 天気の急変（晴れ→雨など）の通知
- 傘持参のリマインダー
- カスタマイズ可能な通知設定

**実装の難易度**: ⭐⭐⭐ (中)

**価値**:
- 天気による失敗（傘忘れなど）を防ぐ
- 服装の選択に役立つ
- プロアクティブな情報提供

**実装例**:
```typescript
// hooks/useWeatherAlerts.ts
export function useWeatherAlerts(weather: WeatherData | null) {
  useEffect(() => {
    if (!weather) return

    const alerts: string[] = []

    // 降水確率が高い場合
    if (weather.precipitation > 5) {
      alerts.push('今日は雨が降りそうです。傘を持っていきましょう！')
    }

    // 気温が極端な場合
    if (weather.temperature < 5) {
      alerts.push('今日はとても寒いです。暖かい服装で！')
    } else if (weather.temperature > 30) {
      alerts.push('今日は暑くなります。水分補給をお忘れなく！')
    }

    // 通知を表示
    if (alerts.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
      alerts.forEach(alert => {
        new Notification('天気アラート', {
          body: alert,
          icon: '/weather-icon.png'
        })
      })
    }
  }, [weather])
}
```

---

### 6. 位置情報のカスタマイズ

**概要**:
現在は東京固定だが、ユーザーの現在地または任意の場所を設定可能に

**機能詳細**:
- Geolocation APIで現在地を自動取得
- 手動で都市を選択可能
- 複数地点の登録（自宅、職場、実家など）
- 地点の切り替え
- 各地点の天気・運行情報を個別に表示

**実装の難易度**: ⭐⭐⭐ (中)

**価値**:
- より正確な地域情報
- 旅行先でも使える
- 家族の住む場所の天気確認

---

### 7. ニュースのカスタマイズ・カテゴリフィルター

**概要**:
ニュースのカテゴリ（経済、テクノロジー、スポーツなど）をユーザーが選択

**機能詳細**:
- カテゴリ別フィルター（政治、経済、テクノロジー、エンタメ、スポーツ）
- キーワードベースのフィルタリング
- 特定のソース（NHK、朝日新聞など）の選択
- 複数のRSSフィード対応
- お気に入り記事の保存

**実装の難易度**: ⭐⭐⭐ (中)

**価値**:
- 興味のある情報だけを表示
- 情報過多を防ぐ
- より効率的な情報収集

---

### 8. モーニングルーティーンチェックリスト

**概要**:
朝の習慣（歯磨き、ストレッチ、朝食など）をチェックリストで管理

**機能詳細**:
- カスタマイズ可能なチェックリスト
- 毎日リセットされる
- ストリーク機能（連続達成日数）
- 達成率のグラフ表示
- 習慣の時間記録
- モチベーション向上の演出（アニメーション、達成バッジ）

**実装の難易度**: ⭐⭐ (低)

**価値**:
- 習慣形成のサポート
- 朝のルーティンの可視化
- 健康的な生活習慣の促進

**実装例**:
```typescript
interface RoutineItem {
  id: string
  title: string
  icon: string
  order: number
  estimatedMinutes: number
}

interface DailyProgress {
  date: string
  completedItems: string[]
  completedAt?: string
}

// components/RoutineCard.tsx
export default function RoutineCard() {
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([
    { id: '1', title: '起床', icon: '🌅', order: 1, estimatedMinutes: 0 },
    { id: '2', title: '歯磨き', icon: '🪥', order: 2, estimatedMinutes: 3 },
    { id: '3', title: '洗顔', icon: '🧼', order: 3, estimatedMinutes: 2 },
    { id: '4', title: 'ストレッチ', icon: '🧘', order: 4, estimatedMinutes: 5 },
    { id: '5', title: '朝食', icon: '🍽️', order: 5, estimatedMinutes: 15 },
    { id: '6', title: '着替え', icon: '👔', order: 6, estimatedMinutes: 5 },
  ])

  const [todayProgress, setTodayProgress] = useState<DailyProgress>(() => {
    const today = new Date().toISOString().split('T')[0]
    const saved = localStorage.getItem(`routine-${today}`)
    return saved ? JSON.parse(saved) : { date: today, completedItems: [] }
  })

  const toggleItem = (itemId: string) => {
    const newCompleted = todayProgress.completedItems.includes(itemId)
      ? todayProgress.completedItems.filter(id => id !== itemId)
      : [...todayProgress.completedItems, itemId]

    const newProgress = { ...todayProgress, completedItems: newCompleted }

    if (newCompleted.length === routineItems.length) {
      newProgress.completedAt = new Date().toISOString()
    }

    setTodayProgress(newProgress)
    localStorage.setItem(`routine-${newProgress.date}`, JSON.stringify(newProgress))
  }

  const completionRate = (todayProgress.completedItems.length / routineItems.length) * 100

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-display font-semibold mb-6">
        <ListChecks className="w-7 h-7 text-orange-500" />
        モーニングルーティン
      </h2>

      {/* 進捗バー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">進捗</span>
          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
            {Math.round(completionRate)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* チェックリスト */}
      <div className="space-y-2">
        {routineItems.map(item => {
          const isCompleted = todayProgress.completedItems.includes(item.id)

          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                isCompleted
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
              }`}
            >
              <span className="text-3xl">{item.icon}</span>
              <div className="flex-1 text-left">
                <p className={`font-medium ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                  {item.title}
                </p>
                <p className="text-xs text-gray-400">約{item.estimatedMinutes}分</p>
              </div>
              {isCompleted && (
                <CheckCircle className="w-6 h-6 text-orange-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* 完了メッセージ */}
      {completionRate === 100 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white text-center">
          <p className="text-lg font-bold">🎉 素晴らしい！</p>
          <p className="text-sm">すべてのルーティンが完了しました</p>
        </div>
      )}
    </div>
  )
}
```

---

## 💡 優先度: 低（将来的に検討）

### 9. 通勤経路・交通情報

**概要**:
自宅から職場までの最適な経路と所要時間を表示

**機能詳細**:
- Google Maps API連携
- 複数の交通手段（徒歩、電車、バス、車）
- リアルタイムの交通状況反映
- 遅延を考慮した出発時刻の提案
- 代替ルートの表示

**実装の難易度**: ⭐⭐⭐⭐ (高)

---

### 10. 為替・株価情報カード

**概要**:
主要通貨の為替レート、気になる株価をリアルタイム表示

**機能詳細**:
- USD/JPY、EUR/JPYなどの為替レート
- 日経平均、ダウ平均などの株価指数
- 個別銘柄の登録・表示
- 前日比の表示（色分け）
- チャート表示（簡易版）

**実装の難易度**: ⭐⭐⭐ (中)

---

### 11. メモ・付箋機能

**概要**:
ちょっとしたメモを残せる付箋カード

**機能詳細**:
- 複数のメモを作成・編集・削除
- 色分け（カテゴリ別）
- Markdown対応
- 検索機能
- ピン留め機能

**実装の難易度**: ⭐⭐ (低)

---

### 12. 音楽プレイヤー / Spotify統合

**概要**:
朝に聴きたい音楽をダッシュボードから再生

**機能詳細**:
- Spotify API連携
- プレイリストの選択
- 現在再生中の曲を表示
- 再生/一時停止コントロール
- 朝専用プレイリストの作成

**実装の難易度**: ⭐⭐⭐⭐ (高)

---

### 13. 健康トラッキング

**概要**:
水分摂取、歩数、睡眠時間などの健康データを記録

**機能詳細**:
- 水分摂取のカウンター
- 歩数の記録（スマートウォッチ連携）
- 睡眠時間の記録
- 目標設定とトラッキング
- グラフで推移を可視化

**実装の難易度**: ⭐⭐⭐⭐ (高)

---

### 14. ポッドキャスト・ラジオカード

**概要**:
朝に聴くポッドキャストやラジオ番組をリスト表示

**機能詳細**:
- Podcast API連携
- お気に入りの番組登録
- 最新エピソードの自動取得
- ワンクリック再生
- radiko連携（ラジオ番組表示）

**実装の難易度**: ⭐⭐⭐⭐ (高)

---

### 15. 気分トラッカー / ジャーナル

**概要**:
毎朝の気分を記録し、メンタルヘルスを可視化

**機能詳細**:
- 5段階の気分評価
- 簡単な日記入力
- 過去の記録をグラフ表示
- 気分のパターン分析
- ポジティブな言葉の提示

**実装の難易度**: ⭐⭐⭐ (中)

---

## 🎨 UI/UX改善提案

### 16. カードのテーマカスタマイズ

**概要**:
各カードの色やアイコンをカスタマイズ可能に

**機能詳細**:
- カードごとの色設定
- アイコンの変更
- フォントサイズの調整
- カードの透明度設定
- プリセットテーマ（シンプル、カラフル、モノクロなど）

**実装の難易度**: ⭐⭐ (低)

---

### 17. ウィジェットサイズの変更

**概要**:
カードのサイズを小・中・大で変更可能に

**機能詳細**:
- 小（1x1）、中（2x1）、大（2x2）のサイズ選択
- レスポンシブグリッドレイアウト
- 重要な情報は大きく表示

**実装の難易度**: ⭐⭐⭐ (中)

---

### 18. アニメーション・トランジション強化

**概要**:
カードの表示、更新時のアニメーションを追加

**機能詳細**:
- カード読み込み時のフェードイン
- データ更新時のスムーズなトランジション
- ドラッグ時のアニメーション改善
- マイクロインタラクションの追加

**実装の難易度**: ⭐⭐ (低)

---

## 📊 技術的な改善提案

### 19. PWA対応（Progressive Web App）

**概要**:
アプリとしてインストール可能にし、オフライン対応

**機能詳細**:
- Service Workerの実装
- オフライン時のキャッシュ表示
- ホーム画面へのインストール
- プッシュ通知
- バックグラウンド同期

**実装の難易度**: ⭐⭐⭐⭐ (高)

**価値**:
- ネイティブアプリのような体験
- 起動が速い
- オフラインでも使える

---

### 20. データのクラウド同期

**概要**:
設定やデータをクラウドに保存し、複数デバイスで同期

**機能詳細**:
- Firebase / Supabase連携
- ユーザーアカウント（認証）
- 自動同期
- デバイス間でのシームレスな移行

**実装の難易度**: ⭐⭐⭐⭐⭐ (非常に高)

---

## 実装優先順位まとめ

### フェーズ1: すぐに実装（1-2週間）
1. ✅ TODOリスト / タスク管理カード
2. ✅ 時計・タイマーカード
3. ✅ モーニングルーティーンチェックリスト

### フェーズ2: 次のバージョン（1ヶ月）
4. ✅ 複数路線の運行情報対応
5. ✅ 天気アラート・通知機能
6. ✅ 位置情報のカスタマイズ
7. ✅ ニュースのカスタマイズ

### フェーズ3: 将来的に（3ヶ月〜）
8. ✅ カレンダー・スケジュール統合
9. ✅ PWA対応
10. ✅ 為替・株価情報

---

## 推奨する実装順序

### 最初に実装すべき機能（最高のROI）

1. **TODOリスト** - 実装が簡単で、ユーザー価値が非常に高い
2. **時計・タイマー** - 朝のダッシュボードの核心機能
3. **モーニングルーティーン** - 差別化ポイント、習慣形成をサポート

これらの3つは：
- ✅ 実装難易度が低い
- ✅ ユーザー価値が高い
- ✅ 既存の機能と相性が良い
- ✅ LocalStorageだけで完結（バックエンド不要）

---

## まとめ

morning-dashboardは、朝に必要な情報を一元化する優れたコンセプトです。上記の機能追加により、以下のような価値を提供できます：

1. **情報の一元化** - 複数のアプリを開かなくても必要な情報がすべて揃う
2. **朝の効率化** - タスク管理、タイマー、ルーティンチェックで時間管理
3. **パーソナライゼーション** - ユーザーごとにカスタマイズ可能
4. **習慣形成** - ルーティンチェックリストで健康的な生活習慣をサポート
5. **モチベーション向上** - 達成感を得られる仕組み

特に、**TODOリスト**、**時計・タイマー**、**モーニングルーティーン**の3つは、実装が簡単でありながらユーザー体験を大きく向上させるため、最優先で実装することを強く推奨します。
