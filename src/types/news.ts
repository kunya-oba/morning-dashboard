/**
 * ニュース関連の型定義
 */

export type NewsCategory = 'all' | 'domestic' | 'world' | 'business' | 'technology' | 'entertainment' | 'sports'

export interface NewsSource {
  id: string
  name: string
  rssUrl: string
  category?: NewsCategory
  icon?: string
}

export interface NewsItem {
  title: string
  link: string
  pubDate: string
  source?: string
  categories: NewsCategory[] // 複数のカテゴリを持つように変更
  description?: string
  isFavorite?: boolean
}

// Google News RSSフィードのカテゴリ別URL
// 注: カテゴリ別は同じRSS URLを使用し、クライアント側でフィルタリング
export const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'google-top',
    name: 'Google ニュース（総合）',
    rssUrl: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
    category: 'all'
  },
  {
    id: 'google-domestic',
    name: 'Google ニュース（国内）',
    rssUrl: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
    category: 'domestic'
  },
  {
    id: 'google-world',
    name: 'Google ニュース（国際）',
    rssUrl: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
    category: 'world'
  },
  {
    id: 'google-business',
    name: 'Google ニュース（ビジネス）',
    rssUrl: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
    category: 'business'
  },
  {
    id: 'google-technology',
    name: 'Google ニュース（テクノロジー）',
    rssUrl: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
    category: 'technology'
  },
  {
    id: 'google-entertainment',
    name: 'Google ニュース（エンタメ）',
    rssUrl: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
    category: 'entertainment'
  },
  {
    id: 'google-sports',
    name: 'Google ニュース（スポーツ）',
    rssUrl: 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja',
    category: 'sports'
  }
]

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  all: '総合',
  domestic: '国内',
  world: '国際',
  business: 'ビジネス',
  technology: 'テクノロジー',
  entertainment: 'エンタメ',
  sports: 'スポーツ'
}

export const CATEGORY_ICONS: Record<NewsCategory, string> = {
  all: '📰',
  domestic: '🏠',
  world: '🌏',
  business: '💼',
  technology: '💻',
  entertainment: '🎬',
  sports: '⚽'
}

// カテゴリ判定用のキーワード
export const CATEGORY_KEYWORDS: Record<Exclude<NewsCategory, 'all'>, string[]> = {
  domestic: ['日本', '東京', '大阪', '政府', '国会', '首相', '知事', '県', '市', '都', '府', '道'],
  world: ['米国', 'アメリカ', '中国', '韓国', '北朝鮮', 'ロシア', 'ヨーロッパ', 'EU', '国連', '海外', '外交', '国際'],
  business: ['経済', '企業', '株価', '市場', '円', 'ドル', '売上', '決算', '投資', 'ビジネス', '業績', '取引'],
  technology: ['AI', '人工知能', 'IT', 'アプリ', 'ソフトウェア', 'ハードウェア', 'テクノロジー', 'デジタル', 'スマホ', 'パソコン', 'Google', 'Apple', 'Microsoft', 'Amazon', 'Meta'],
  entertainment: ['芸能', '映画', 'ドラマ', '音楽', 'アニメ', '漫画', 'タレント', '俳優', '女優', 'アイドル', 'エンタメ'],
  sports: ['野球', 'サッカー', 'テニス', 'バスケ', 'ゴルフ', 'オリンピック', '大会', '選手', 'スポーツ', 'W杯', '日本代表']
}
