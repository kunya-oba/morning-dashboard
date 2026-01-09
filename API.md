# API仕様書

morning-dashboardで使用している外部APIと内部データフローの詳細仕様です。

---

## 📋 目次

1. [外部API一覧](#外部api一覧)
2. [天気情報API](#天気情報api)
3. [運行情報API](#運行情報api)
4. [ニュースAPI](#ニュースapi)
5. [記念日情報API](#記念日情報api)
6. [名言API](#名言api)
7. [背景画像API](#背景画像api)
8. [データフロー](#データフロー)
9. [エラーハンドリング](#エラーハンドリング)

---

## 🌐 外部API一覧

| API | 用途 | 認証 | 制限 | 更新頻度 | プロキシ |
|-----|------|------|------|----------|----------|
| Open-Meteo | 天気情報 | 不要 | なし | 10分 | 不要 |
| 東京都交通局 | 運行情報 | 不要 | なし | 5分 | 必要 |
| Google News RSS | ニュース | 不要 | なし | 15分 | 必要 |
| Wikipedia | 記念日 | 不要 | なし | - | 不要 |
| ZenQuotes | 名言 | 不要 | なし | 手動 | 必要 |
| MyMemory | 翻訳 | 不要 | 1000回/日 | - | 不要 |
| Unsplash | 背景画像 | APIキー | 5000回/月 | 日次 | 不要 |
| Picsum Photos | 背景画像 | 不要 | なし | 日次 | 不要 |

---

## ☀️ 天気情報API

### Open-Meteo API

#### エンドポイント
```
GET https://api.open-meteo.com/v1/forecast
```

#### パラメータ

| パラメータ | 型 | 必須 | 説明 | 例 |
|-----------|-----|------|------|-----|
| latitude | number | ✓ | 緯度 | 35.6762 |
| longitude | number | ✓ | 経度 | 139.6503 |
| current | string | ✓ | 取得する現在の気象データ | temperature_2m,weather_code,... |
| hourly | string | ✓ | 取得する時間別データ | temperature_2m |
| timezone | string | ✓ | タイムゾーン | Asia/Tokyo |
| forecast_days | number | - | 予報日数 | 1 |

#### リクエスト例

```typescript
const response = await axios.get(
  'https://api.open-meteo.com/v1/forecast',
  {
    params: {
      latitude: 35.6762,
      longitude: 139.6503,
      current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
      hourly: 'temperature_2m',
      timezone: 'Asia/Tokyo',
      forecast_days: 1
    }
  }
)
```

#### レスポンス

```json
{
  "current": {
    "time": "2026-01-09T10:00",
    "temperature_2m": 12.5,
    "relative_humidity_2m": 65,
    "precipitation": 0.0,
    "weather_code": 0,
    "wind_speed_10m": 3.2
  },
  "hourly": {
    "time": ["2026-01-09T00:00", "2026-01-09T01:00", ...],
    "temperature_2m": [10.5, 10.8, 11.2, ...]
  }
}
```

#### 天気コード（WMO Weather Interpretation Codes）

| コード | 天気 | アイコン |
|--------|------|----------|
| 0 | 快晴 | ☀️ Sun |
| 1-3 | 曇り | ☁️ Cloud |
| 45-48 | 霧 | 🌫️ Cloud |
| 51-67 | 雨 | 🌧️ CloudRain |
| 71-77 | 雪 | 🌨️ CloudSnow |
| 80-99 | 雷雨 | ⛈️ CloudRain |

#### データ型定義

```typescript
interface WeatherData {
  temperature: number        // 気温（℃）
  weatherCode: number        // 天気コード
  precipitation: number      // 降水量（mm）
  windSpeed: number          // 風速（m/s）
  humidity: number           // 湿度（%）
}

interface HourlyTemperature {
  time: string              // ISO 8601形式
  temperature: number       // 気温（℃）
}
```

#### エラーハンドリング

```typescript
try {
  const response = await axios.get(url)
  // 処理
} catch (err) {
  console.error('天気情報の取得に失敗しました:', err)
  setError('天気情報を取得できませんでした')
}
```

---

## 🚇 運行情報API

### 東京都交通局 公式サイト

#### エンドポイント
```
GET https://www.kotsu.metro.tokyo.jp/subway/schedule/asakusa.html
```

#### プロキシ経由でのアクセス

CORS制限があるため、プロキシ経由でアクセスします。

```typescript
const proxies = [
  `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
  `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`
]
```

#### HTMLパース処理

```typescript
// HTMLをパース
const parser = new DOMParser()
const doc = parser.parseFromString(htmlContent, 'text/html')

// 運行情報を抽出
const infoElements = doc.querySelectorAll('.InformationUnkou')
const textContent = Array.from(infoElements)
  .map(el => el.textContent?.trim())
  .join(' ')
```

#### 運行状態の判定

```typescript
// 平常運転の判定
const hasNoDelay =
  textContent.includes('遅延はありません') ||
  textContent.includes('平常通り') ||
  textContent.includes('通常通り')

// 遅延・運転見合わせの判定
const hasDelay =
  textContent.includes('遅延が発生') ||
  textContent.includes('運転見合わせ') ||
  textContent.includes('ダイヤ乱れ')
```

#### データ型定義

```typescript
interface TrainStatus {
  operator: string          // 運営事業者（例: 都営地下鉄）
  railway: string           // 路線名（例: 浅草線）
  status: string            // 運行状態（平常運転 / 遅延・運転見合わせ等あり）
  detail?: string           // 詳細情報
}
```

#### 注意事項

- HTMLの構造が変更されると動作しなくなる可能性があります
- 複数のセレクタでフォールバック処理を実装しています
- 定期的なメンテナンスが必要です

---

## 📰 ニュースAPI

### Google News RSS

#### エンドポイント
```
GET https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja
```

#### プロキシ経由でのアクセス

```typescript
const proxies = [
  `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`,
  `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`,
  `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`
]
```

#### XMLパース処理

```typescript
// XMLをパース
const parser = new DOMParser()
const xmlDoc = parser.parseFromString(response.data, 'text/xml')

// ニュース項目を取得
const items = xmlDoc.querySelectorAll('item')

items.forEach((item, index) => {
  if (index < 5) { // 最新5件のみ
    const title = item.querySelector('title')?.textContent || ''
    const link = item.querySelector('link')?.textContent || ''
    const pubDate = item.querySelector('pubDate')?.textContent || ''
    const source = item.querySelector('source')?.textContent || ''

    newsItems.push({ title, link, pubDate, source })
  }
})
```

#### データ型定義

```typescript
interface NewsItem {
  title: string             // ニュースタイトル
  link: string              // 記事URL
  pubDate: string           // 公開日時（RFC 2822形式）
  source?: string           // ニュースソース
}
```

#### 日付フォーマット

```typescript
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    return `${diffInMinutes}分前`
  } else if (diffInHours < 24) {
    return `${diffInHours}時間前`
  } else {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}
```

---

## 🎯 記念日情報API

### Wikipedia API

#### エンドポイント
```
GET https://ja.wikipedia.org/api/rest_v1/page/summary/{月月}{日日}
```

#### リクエスト例

```typescript
const today = new Date()
const month = today.getMonth() + 1
const day = today.getDate()

const response = await axios.get(
  `https://ja.wikipedia.org/api/rest_v1/page/summary/${month}月${day}日`,
  { timeout: 10000 }
)
```

#### レスポンス

```json
{
  "title": "1月9日",
  "extract": "1月9日（いちがつここのか）は、グレゴリオ暦で年始から9日目に当たり、年末まであと356日（閏年では357日）ある。...",
  "extract_html": "<p>1月9日（いちがつここのか）は...</p>"
}
```

#### 記念日の抽出

```typescript
// 正規表現で記念日パターンを抽出
const anniversaryPattern = /[^、。]*(?:の日|記念日)[^、。]*/g
const matches = description.match(anniversaryPattern)

if (matches && matches.length > 0) {
  // ランダムに1つ選択
  const randomMatch = matches[Math.floor(Math.random() * matches.length)]
  selectedAnniversary = {
    title: randomMatch.trim(),
    description: `${month}月${day}日は${randomMatch.trim()}です。`
  }
}
```

#### データ型定義

```typescript
interface Anniversary {
  title: string             // 記念日名
  description: string       // 説明文
}
```

#### フォールバックデータ

Wikipedia APIが利用できない場合は、内蔵の記念日データベースを使用します。

```typescript
const fallbackAnniversaries: Record<string, Anniversary> = {
  '1-1': { title: '元日', description: '1月1日は元日です。...' },
  '2-14': { title: 'バレンタインデー', description: '2月14日は...' },
  // ... 30日分のデータ
}
```

---

## 💭 名言API

### ZenQuotes API

#### エンドポイント
```
GET https://zenquotes.io/api/random
```

#### プロキシ経由でのアクセス

```typescript
const proxies = [
  `https://api.allorigins.win/get?url=${encodeURIComponent(zenQuotesUrl)}`,
  `https://corsproxy.io/?${encodeURIComponent(zenQuotesUrl)}`
]
```

#### レスポンス

```json
[
  {
    "q": "The only way to do great work is to love what you do.",
    "a": "Steve Jobs",
    "h": "<blockquote>...</blockquote>"
  }
]
```

### 翻訳API

#### MyMemory Translation API

**エンドポイント**:
```
GET https://api.mymemory.translated.net/get
```

**パラメータ**:
- `q`: 翻訳するテキスト
- `langpair`: 言語ペア（例: `en|ja`）

**リクエスト例**:
```typescript
const response = await axios.get(
  'https://api.mymemory.translated.net/get',
  {
    params: {
      q: content,
      langpair: 'en|ja'
    }
  }
)
```

**レスポンス**:
```json
{
  "responseData": {
    "translatedText": "素晴らしい仕事をする唯一の方法は、自分がしていることを愛することです。"
  },
  "responseStatus": 200
}
```

#### LibreTranslate API（フォールバック）

**エンドポイント**:
```
POST https://libretranslate.com/translate
```

**リクエストボディ**:
```json
{
  "q": "The only way to do great work is to love what you do.",
  "source": "en",
  "target": "ja",
  "format": "text"
}
```

#### データ型定義

```typescript
interface QuoteData {
  text: string              // 英語原文
  author: string            // 著者名
  textJa: string            // 日本語訳
}
```

---

## 🖼️ 背景画像API

### Picsum Photos（デフォルト）

#### エンドポイント
```
GET https://picsum.photos/seed/{seed}/{width}/{height}
```

#### パラメータ

- `seed`: シード値（日付を使用: YYYYMMDD）
- `width`: 幅（例: 1920）
- `height`: 高さ（例: 1080）

#### リクエスト例

```typescript
const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
const seed = today.replace(/-/g, '') // YYYYMMDD
const imageUrl = `https://picsum.photos/seed/${seed}/1920/1080`
```

### Unsplash API（オプション）

#### エンドポイント
```
GET https://api.unsplash.com/photos/random
```

#### 認証

```typescript
headers: {
  Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`
}
```

#### パラメータ

| パラメータ | 型 | 説明 | 例 |
|-----------|-----|------|-----|
| query | string | 検索キーワード | morning,sunrise,nature |
| orientation | string | 画像の向き | landscape |
| w | number | 幅 | 1920 |
| h | number | 高さ | 1080 |

#### レスポンス

```json
{
  "id": "abc123",
  "urls": {
    "raw": "https://images.unsplash.com/...",
    "full": "https://images.unsplash.com/...",
    "regular": "https://images.unsplash.com/...",
    "small": "https://images.unsplash.com/...",
    "thumb": "https://images.unsplash.com/..."
  }
}
```

#### データ型定義

```typescript
interface BackgroundImageState {
  imageUrl: string | null
  loading: boolean
  error: string | null
}
```

#### キャッシュ機構

```typescript
// LocalStorageに日付とURLを保存
localStorage.setItem('backgroundImage', JSON.stringify({
  date: today,
  url: imageUrl
}))

// 同じ日付ならキャッシュを使用
const cachedData = localStorage.getItem('backgroundImage')
if (cachedData) {
  const parsed = JSON.parse(cachedData)
  if (parsed.date === today) {
    return parsed.url
  }
}
```

---

## 🔄 データフロー

### 全体のデータフロー

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │
       │ useEffect
       ▼
┌──────────────────┐
│  Component       │
│  (WeatherCard)   │
└──────┬───────────┘
       │
       │ axios.get()
       ▼
┌──────────────────┐
│  External API    │
│  (Open-Meteo)    │
└──────┬───────────┘
       │
       │ JSON Response
       ▼
┌──────────────────┐
│  State Update    │
│  (setWeather)    │
└──────┬───────────┘
       │
       │ Re-render
       ▼
┌──────────────────┐
│  UI Update       │
└──────────────────┘
```

### CORSプロキシを使用するデータフロー

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │
       │ axios.get(proxyUrl)
       ▼
┌──────────────────┐
│  CORS Proxy      │
│  (AllOrigins)    │
└──────┬───────────┘
       │
       │ Forward Request
       ▼
┌──────────────────┐
│  Target API      │
│  (Google News)   │
└──────┬───────────┘
       │
       │ Response
       ▼
┌──────────────────┐
│  CORS Proxy      │
│  (wrap response) │
└──────┬───────────┘
       │
       │ { contents: "..." }
       ▼
┌──────────────────┐
│  Component       │
│  (parse & show)  │
└──────────────────┘
```

### LocalStorageとの連携

```
┌─────────────────┐
│  User Action    │
│  (drag card)    │
└────────┬────────┘
         │
         │ handleDragEnd
         ▼
┌─────────────────┐
│  State Update   │
│  (setCardOrder) │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────┐
│  UI Update      │  │ LocalStorage │
│  (re-render)    │  │ .setItem()   │
└─────────────────┘  └──────────────┘
```

---

## ⚠️ エラーハンドリング

### 基本パターン

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get(url, { timeout: 10000 })
      setData(response.data)
    } catch (err) {
      console.error('データ取得失敗:', err)
      setError('データを取得できませんでした')

      // フォールバックデータを使用
      setData(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [])
```

### 複数プロキシのフォールバック

```typescript
const proxies = [
  'https://api.allorigins.win/get?url=...',
  'https://corsproxy.io/?...'
]

let response = null
let lastError = null

for (const proxyUrl of proxies) {
  try {
    response = await axios.get(proxyUrl, { timeout: 10000 })
    break // 成功したら終了
  } catch (err) {
    console.warn('プロキシ失敗:', proxyUrl, err)
    lastError = err
    continue // 次のプロキシを試行
  }
}

if (!response) {
  throw lastError || new Error('すべてのプロキシが失敗')
}
```

### タイムアウト処理

```typescript
const response = await axios.get(url, {
  timeout: 10000 // 10秒でタイムアウト
})
```

### リトライ処理

```typescript
const fetchWithRetry = async (url: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url)
      return response.data
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

---

## 🔒 セキュリティとレート制限

### APIキーの管理

```typescript
// ❌ Bad: ハードコード
const apiKey = "abc123"

// ✅ Good: 環境変数
const apiKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
```

### レート制限への対応

| API | 制限 | 対策 |
|-----|------|------|
| Open-Meteo | なし | - |
| MyMemory | 1000回/日 | フォールバックAPI（LibreTranslate） |
| Unsplash | 5000回/月 | キャッシュ、Picsumへのフォールバック |

### キャッシュ戦略

```typescript
// 日付ベースのキャッシュ
const today = new Date().toISOString().split('T')[0]
const cacheKey = `data-${today}`

// キャッシュを確認
const cached = localStorage.getItem(cacheKey)
if (cached) {
  return JSON.parse(cached)
}

// 新規取得してキャッシュ
const data = await fetchData()
localStorage.setItem(cacheKey, JSON.stringify(data))
```

---

## 📊 パフォーマンス最適化

### 定期更新の管理

```typescript
useEffect(() => {
  const fetchData = async () => { /* ... */ }

  fetchData() // 初回実行

  const interval = setInterval(fetchData, 10 * 60 * 1000) // 10分ごと

  return () => clearInterval(interval) // クリーンアップ
}, [])
```

### 並列リクエスト

```typescript
// ❌ Bad: 順次実行
const weather = await fetchWeather()
const news = await fetchNews()
const quote = await fetchQuote()

// ✅ Good: 並列実行
const [weather, news, quote] = await Promise.all([
  fetchWeather(),
  fetchNews(),
  fetchQuote()
])
```

---

**このAPI仕様書は、プロジェクトの発展に伴い継続的に更新されます。**
