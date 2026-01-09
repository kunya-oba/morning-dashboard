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
  category?: NewsCategory
  description?: string
  isFavorite?: boolean
}

// Google News RSSフィードのカテゴリ別URL
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
    rssUrl: 'https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRFZxYUdjU0JXcGhMVXhRS0FBUAE?hl=ja&gl=JP&ceid=JP:ja',
    category: 'domestic'
  },
  {
    id: 'google-world',
    name: 'Google ニュース（国際）',
    rssUrl: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0JXcGhMVXhRS0FBUAE?hl=ja&gl=JP&ceid=JP:ja',
    category: 'world'
  },
  {
    id: 'google-business',
    name: 'Google ニュース（ビジネス）',
    rssUrl: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0JXcGhMVXhRS0FBUAE?hl=ja&gl=JP&ceid=JP:ja',
    category: 'business'
  },
  {
    id: 'google-technology',
    name: 'Google ニュース（テクノロジー）',
    rssUrl: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0JXcGhMVXhRS0FBUAE?hl=ja&gl=JP&ceid=JP:ja',
    category: 'technology'
  },
  {
    id: 'google-entertainment',
    name: 'Google ニュース（エンタメ）',
    rssUrl: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0JXcGhMVXhRS0FBUAE?hl=ja&gl=JP&ceid=JP:ja',
    category: 'entertainment'
  },
  {
    id: 'google-sports',
    name: 'Google ニュース（スポーツ）',
    rssUrl: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp1ZEdvU0JXcGhMVXhRS0FBUAE?hl=ja&gl=JP&ceid=JP:ja',
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
