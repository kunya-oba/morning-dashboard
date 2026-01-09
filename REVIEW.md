# コードレビュー: morning-dashboard

レビュー日: 2026-01-09
レビュワー: Claude Code

---

## 全体評価

プロジェクトは概ね良好な構造で実装されており、機能的には十分に動作しています。しかし、いくつかの改善点とセキュリティ、パフォーマンス、保守性の観点から指摘すべき問題が見つかりました。

**評価スコア: B+**

### 長所
- モダンな技術スタック（React 19, TypeScript, Vite）
- 適切なコンポーネント分割
- ダークモード対応
- ドラッグ&ドロップ機能の実装
- エラーハンドリングの実装
- レスポンシブデザイン

### 短所
- パフォーマンスの最適化が不足
- 型定義が不完全
- エラー処理の一貫性がない
- テストコードがない
- 環境変数の管理が不適切

---

## 🔴 Critical（重要度: 高）

### 1. 環境変数の誤った管理
**ファイル**: `src/hooks/useBackgroundImage.ts:45`

```typescript
const unsplashAccessKey = ""
```

**問題点**:
- Unsplash APIキーがハードコードされており、空文字列になっている
- 本来は環境変数（`import.meta.env.VITE_UNSPLASH_ACCESS_KEY`）から取得すべき
- 現在の実装では、APIキーを設定してもViteの環境変数システムが機能していない

**改善案**:
```typescript
const unsplashAccessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || ""
```

**根拠**: Viteの環境変数システムを正しく使用することで、開発・本番環境での設定分離が可能になり、セキュリティも向上します。

---

### 2. ダークモードの検出が再レンダリング時に動的に更新されない
**ファイル**: `src/components/WeatherCard.tsx:163, 168, 183-187`

```typescript
stroke={document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'}
```

**問題点**:
- グラフのスタイルがコンポーネントレンダリング時に一度だけ決定される
- ダークモードを切り替えても、グラフの色が更新されない
- `document.documentElement.classList.contains('dark')`は静的な値として評価される

**改善案**:
```typescript
// Appコンポーネント内で管理しているisDarkステートをpropsで渡す
export default function WeatherCard({ isDark }: { isDark: boolean }) {
  // ...
  stroke={isDark ? '#374151' : '#e5e7eb'}
}
```

または、カスタムフックを作成:
```typescript
// hooks/useDarkMode.ts
export function useDarkMode() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return isDark
}
```

**根拠**: UIの状態はReactの状態管理で管理すべきであり、DOMを直接参照する方法は推奨されません。

---

### 3. 型定義の不足
**ファイル**: 複数

**問題点**:
- axios応答の型が`any`として扱われている
- API応答の型定義がない

**改善案**:
```typescript
// types/api.ts を作成
export interface OpenMeteoResponse {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    precipitation: number
    weather_code: number
    wind_speed_10m: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
  }
}

// WeatherCard.tsx内で使用
const response = await axios.get<OpenMeteoResponse>(url)
const current = response.data.current // 型安全
```

**根拠**: TypeScriptの利点を最大限に活用し、実行時エラーを防ぐため。

---

## 🟡 Warning（重要度: 中）

### 4. console.logの残存
**ファイル**: 複数（TrainStatusCard、NewsCard、QuoteCard）

**問題点**:
- 本番環境でも`console.log`が実行される
- パフォーマンスへの影響とセキュリティリスク（情報漏洩）

**改善案**:
開発用のロガーユーティリティを作成:
```typescript
// utils/logger.ts
const isDev = import.meta.env.DEV

export const logger = {
  log: (...args: any[]) => isDev && console.log(...args),
  warn: (...args: any[]) => isDev && console.warn(...args),
  error: (...args: any[]) => console.error(...args), // エラーは常に出力
}

// 使用例
import { logger } from '../utils/logger'
logger.log('運行情報取得開始...')
```

**根拠**: 本番環境でのログ出力は避けるべきです。

---

### 5. 不要な再レンダリングとメモ化の欠如
**ファイル**: `src/App.tsx`

**問題点**:
- `renderCard`関数が毎回再生成される
- `getColSpan`関数が毎回再生成される
- 子コンポーネントが不要に再レンダリングされる可能性

**改善案**:
```typescript
import { useMemo, useCallback } from 'react'

// コンポーネント外に移動（純粋関数の場合）
const getColSpan = (id: string): number => {
  return id === 'news' ? 2 : 1
}

function App() {
  // または useCallback を使用
  const renderCard = useCallback((id: string) => {
    switch (id) {
      case 'weather':
        return <WeatherCard />
      case 'train':
        return <TrainStatusCard />
      // ...
    }
  }, [])

  // ...
}
```

**根拠**: 不要な関数の再生成を防ぎ、パフォーマンスを向上させます。

---

### 6. エラー境界（Error Boundary）がない
**ファイル**: プロジェクト全体

**問題点**:
- コンポーネントのエラーが適切に処理されない
- アプリ全体がクラッシュする可能性

**改善案**:
```typescript
// components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('エラーが発生しました:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <h2 className="text-red-800 dark:text-red-200 font-bold mb-2">
            エラーが発生しました
          </h2>
          <p className="text-red-600 dark:text-red-400 text-sm">
            ページを再読み込みしてください
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

// App.tsx または main.tsx で使用
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**根拠**: React公式が推奨するエラーハンドリングパターン。

---

### 7. interval のクリーンアップが不完全
**ファイル**: 複数のコンポーネント

**問題点**:
- `setInterval`のクリーンアップは実装されているが、非同期処理の途中でコンポーネントがアンマウントされた場合のハンドリングがない

**改善案**:
```typescript
useEffect(() => {
  let isMounted = true

  const fetchData = async () => {
    try {
      const response = await axios.get(url)
      // コンポーネントがまだマウントされている場合のみ状態を更新
      if (isMounted) {
        setData(response.data)
      }
    } catch (err) {
      if (isMounted) {
        setError(err)
      }
    }
  }

  fetchData()
  const interval = setInterval(fetchData, 60000)

  return () => {
    isMounted = false
    clearInterval(interval)
  }
}, [])
```

または、より現代的なアプローチとして`AbortController`を使用:
```typescript
useEffect(() => {
  const controller = new AbortController()

  const fetchData = async () => {
    try {
      const response = await axios.get(url, {
        signal: controller.signal
      })
      setData(response.data)
    } catch (err) {
      if (err.name !== 'CanceledError') {
        setError(err)
      }
    }
  }

  fetchData()
  const interval = setInterval(fetchData, 60000)

  return () => {
    controller.abort()
    clearInterval(interval)
  }
}, [])
```

**根拠**: メモリリークを防ぎ、コンポーネントのライフサイクルを適切に管理します。

---

### 8. CORSプロキシへの依存
**ファイル**: TrainStatusCard、NewsCard、QuoteCard

**問題点**:
- サードパーティのCORSプロキシに依存している
- プロキシサービスが停止すると機能が動作しなくなる
- セキュリティリスク（中間者攻撃の可能性）

**改善案**:
1. バックエンドAPIを構築し、そこでAPIリクエストを処理する
2. Vercel/Netlifyのサーバーレス関数を使用
3. Cloudflare Workersを使用

```typescript
// netlify/functions/fetch-news.ts (例)
import type { Handler } from '@netlify/functions'
import axios from 'axios'

export const handler: Handler = async (event) => {
  try {
    const response = await axios.get('https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja')

    return {
      statusCode: 200,
      body: JSON.stringify({ data: response.data })
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch news' })
    }
  }
}

// フロントエンドから呼び出し
const response = await axios.get('/.netlify/functions/fetch-news')
```

**根拠**: サードパーティサービスへの依存を減らし、セキュリティとパフォーマンスを向上させます。

---

## 🟢 Info（重要度: 低）

### 9. マジックナンバーの使用
**ファイル**: 複数

**問題点**:
```typescript
const interval = setInterval(fetchWeather, 600000) // 600000って何？
```

**改善案**:
```typescript
// constants/intervals.ts
export const INTERVALS = {
  WEATHER_UPDATE: 10 * 60 * 1000,  // 10分
  TRAIN_STATUS_UPDATE: 5 * 60 * 1000,  // 5分
  NEWS_UPDATE: 15 * 60 * 1000,  // 15分
} as const

// コンポーネント内で使用
import { INTERVALS } from '../constants/intervals'
const interval = setInterval(fetchWeather, INTERVALS.WEATHER_UPDATE)
```

**根拠**: コードの可読性と保守性が向上します。

---

### 10. コンポーネントの責務が大きい
**ファイル**: `src/App.tsx`

**問題点**:
- ダークモードの管理
- 背景画像の管理
- カードの順序管理
- すべてが1つのコンポーネントに集中している

**改善案**:
カスタムフックに分離:
```typescript
// hooks/useCardOrder.ts
export function useCardOrder() {
  const defaultCardOrder = ['weather', 'train', 'anniversary', 'quote', 'news']
  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    const savedOrder = localStorage.getItem('cardOrder')
    return savedOrder ? JSON.parse(savedOrder) : defaultCardOrder
  })

  const handleDragEnd = (event: DragEndEvent) => {
    // ドラッグ処理
  }

  return { cardOrder, handleDragEnd }
}

// hooks/useDarkMode.ts
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDark(prefersDark)
  }, [])

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return { isDark, toggleDarkMode }
}

// App.tsx で使用
function App() {
  const { isDark, toggleDarkMode } = useDarkMode()
  const { cardOrder, handleDragEnd } = useCardOrder()
  const { imageUrl, loading: bgLoading } = useBackgroundImage()

  // ...
}
```

**根拠**: 単一責任の原則（SRP）に従い、コードの再利用性とテスタビリティを向上させます。

---

### 11. アクセシビリティの改善余地
**ファイル**: 複数

**問題点**:
- キーボードナビゲーションの対応が不完全
- ARIA属性の不足
- フォーカス管理が不十分

**改善案**:
```typescript
// ニュースリンクの改善例
<a
  href={item.link}
  target="_blank"
  rel="noopener noreferrer"
  aria-label={`ニュース記事: ${item.title}`}
  className="..."
>
  {/* ... */}
</a>

// ダークモード切り替えボタンの改善
<button
  onClick={toggleDarkMode}
  aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
  aria-pressed={isDark}
  className="..."
>
  {/* ... */}
</button>
```

**根拠**: Web Content Accessibility Guidelines (WCAG) 2.1に準拠し、すべてのユーザーにアクセス可能なUIを提供します。

---

### 12. 日付フォーマット関数の重複
**ファイル**: AnniversaryCard、NewsCard

**問題点**:
- 各コンポーネントで日付フォーマット処理が重複している

**改善案**:
```typescript
// utils/dateFormatter.ts
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

export const formatJapaneseDate = (date: Date = new Date()): string => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}
```

**根拠**: DRY原則（Don't Repeat Yourself）に従い、保守性を向上させます。

---

### 13. 画像の遅延読み込みとプリロード
**ファイル**: `src/hooks/useBackgroundImage.ts`

**問題点**:
- 背景画像の読み込み中、ユーザーに視覚的フィードバックが不足
- プリロードの最適化がない

**改善案**:
```typescript
export function useBackgroundImage() {
  // ...

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      // ...

      // 画像のプリロード戦略
      const img = new Image()
      img.loading = 'eager' // 優先的に読み込み

      // 低解像度版を先に読み込む（Progressive loading）
      const lowResUrl = imageUrl.replace('/1920/1080', '/800/450')
      const lowResImg = new Image()

      lowResImg.onload = () => {
        setState(prev => ({
          ...prev,
          imageUrl: lowResUrl,
          loading: false
        }))

        // 高解像度版を読み込み
        img.src = imageUrl
      }

      img.onload = () => {
        setState(prev => ({
          ...prev,
          imageUrl: imageUrl
        }))
      }

      lowResImg.src = lowResUrl
    }

    fetchBackgroundImage()
  }, [])
}
```

**根拠**: 体感パフォーマンスの向上。

---

### 14. HTMLスクレイピングの脆弱性
**ファイル**: `src/components/TrainStatusCard.tsx`

**問題点**:
- HTMLスクレイピングは、サイトのHTML構造変更に非常に脆弱
- 複数のフォールバックセレクタがあるが、本質的な解決にはならない

**改善案**:
1. 公式APIがある場合は、APIを使用する
2. 定期的な監視とアラート機能を実装
3. ユーザーに公式サイトへのリンクを明示する

```typescript
{error && (
  <div className="mt-4">
    <a
      href="https://www.kotsu.metro.tokyo.jp/subway/schedule/asakusa.html"
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
    >
      公式サイトで最新情報を確認 →
    </a>
  </div>
)}
```

**根拠**: スクレイピングは不安定であり、公式データソースの使用が望ましい。

---

### 15. TypeScript strict モードの活用不足
**ファイル**: 複数

**問題点**:
- `as string`などの型アサーションが多用されている
- nullチェックが不十分

**改善例**:
```typescript
// 改善前
const oldIndex = items.indexOf(active.id as string)

// 改善後
if (typeof active.id !== 'string' || typeof over.id !== 'string') {
  return
}
const oldIndex = items.indexOf(active.id)
const newIndex = items.indexOf(over.id)
```

**根拠**: 型安全性を高め、実行時エラーを防ぐ。

---

## 追加の推奨事項

### 16. テストコードの追加
**優先度**: 高

プロジェクトにテストコードがありません。以下のテスト戦略を推奨します：

```typescript
// __tests__/components/WeatherCard.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import WeatherCard from '../src/components/WeatherCard'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('WeatherCard', () => {
  it('ローディング状態を表示する', () => {
    render(<WeatherCard />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('天気データを正しく表示する', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        current: {
          temperature_2m: 20,
          weather_code: 0,
          // ...
        }
      }
    })

    render(<WeatherCard />)

    await waitFor(() => {
      expect(screen.getByText('20°C')).toBeInTheDocument()
    })
  })
})
```

### 17. Linting と Formatting の設定
**優先度**: 中

ESLintとPrettierの設定を追加:

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error"
  }
}

// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 18. パフォーマンス監視
**優先度**: 低

Web Vitalsの測定を追加:

```typescript
// src/utils/vitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals'

export function reportWebVitals() {
  onCLS(console.log)
  onFID(console.log)
  onFCP(console.log)
  onLCP(console.log)
  onTTFB(console.log)
}

// main.tsx
import { reportWebVitals } from './utils/vitals'
reportWebVitals()
```

---

## まとめ

### 優先順位別の対応推奨事項

#### 🔴 即座に対応すべき項目
1. 環境変数の適切な管理（#1）
2. ダークモードの状態管理の修正（#2）
3. 型定義の追加（#3）

#### 🟡 次のスプリント/イテレーションで対応すべき項目
4. console.logの削除（#4）
5. パフォーマンスの最適化（#5）
6. エラー境界の追加（#6）
7. interval クリーンアップの改善（#7）
8. CORSプロキシの代替案検討（#8）

#### 🟢 リファクタリング時に対応すべき項目
9. マジックナンバーの定数化（#9）
10. コンポーネントの責務分離（#10）
11. アクセシビリティの改善（#11）
12. 日付フォーマット関数の統一（#12）
13. 画像読み込みの最適化（#13）
14. スクレイピングの改善（#14）
15. 型アサーションの削減（#15）

#### 📚 長期的に追加すべき項目
16. テストコードの追加
17. Linting/Formatting設定
18. パフォーマンス監視

---

## 結論

このプロジェクトは、基本的な機能は十分に実装されており、ユーザー体験も良好です。しかし、保守性、拡張性、パフォーマンスの観点から、上記の改善を行うことで、より堅牢で高品質なアプリケーションになります。

特に、環境変数の管理、ダークモードの状態管理、型安全性の向上は早急に対応すべき項目です。これらを修正することで、開発体験が向上し、バグの発生を未然に防ぐことができます。

また、テストコードの追加は、長期的な保守性を大幅に向上させるため、次のフェーズでの実装を強く推奨します。
