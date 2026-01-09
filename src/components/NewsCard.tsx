import { useEffect, useState } from 'react'
import { Newspaper, ExternalLink, Loader2, AlertCircle, Search, Star, Filter, X } from 'lucide-react'
import axios from 'axios'
import { logger } from '../utils/logger'
import { INTERVALS } from '../constants/intervals'
import { formatRelativeTime } from '../utils/dateFormatter'
import { NewsItem, NewsCategory, NEWS_SOURCES, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_KEYWORDS } from '../types/news'

// ニュースのカテゴリを自動判定する関数
const detectCategory = (title: string, description: string): NewsCategory[] => {
  const text = `${title} ${description}`.toLowerCase()
  const categories: NewsCategory[] = ['all'] // 常に'all'を含む

  // 各カテゴリのキーワードをチェック
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      categories.push(category as NewsCategory)
    }
  }

  return categories
}

export default function NewsCard() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // フィルター設定
  const [selectedCategories, setSelectedCategories] = useState<NewsCategory[]>(() => {
    const saved = localStorage.getItem('newsCategories')
    return saved ? JSON.parse(saved) : ['all']
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('newsFavorites')
    return saved ? JSON.parse(saved) : []
  })

  // フィルター設定をLocalStorageに保存
  useEffect(() => {
    localStorage.setItem('newsCategories', JSON.stringify(selectedCategories))
  }, [selectedCategories])

  useEffect(() => {
    localStorage.setItem('newsFavorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        setError(null)

        logger.log('選択されたカテゴリ:', selectedCategories)

        // Google News RSSを1回だけ取得
        const source = NEWS_SOURCES[0] // 総合ニュースのみ取得
        const allNews: NewsItem[] = []

        const proxies = [
          `https://api.allorigins.win/get?url=${encodeURIComponent(source.rssUrl)}`,
          `https://corsproxy.io/?${encodeURIComponent(source.rssUrl)}`
        ]

        let fetchSuccess = false
        for (const proxyUrl of proxies) {
          try {
            logger.log(`ニュースを取得中... (プロキシ: ${proxyUrl.split('?')[0]})`)
            const response = await axios.get(proxyUrl, { timeout: 10000 })

            // AllOrigins の場合、contentsプロパティを確認
            const xmlText = response.data.contents || response.data

            // XMLをパース
            const parser = new DOMParser()
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

            // パースエラーをチェック
            const parserError = xmlDoc.querySelector('parsererror')
            if (parserError) {
              logger.error('XMLパースエラー:', parserError.textContent)
              continue
            }

            const items = xmlDoc.querySelectorAll('item')
            logger.log(`${items.length}件の記事を取得`)

            items.forEach((item) => {
              const title = item.querySelector('title')?.textContent || ''
              const link = item.querySelector('link')?.textContent || ''
              const pubDate = item.querySelector('pubDate')?.textContent || ''
              const description = item.querySelector('description')?.textContent || ''

              if (title && link) {
                // カテゴリを自動判定
                const categories = detectCategory(title, description)

                allNews.push({
                  title: title.trim(),
                  link: link.trim(),
                  pubDate: pubDate.trim(),
                  source: source.name,
                  categories: categories,
                  description: description.trim(),
                  isFavorite: favorites.includes(link)
                })
              }
            })

            logger.log(`${items.length}件の記事を処理完了`)
            fetchSuccess = true
            break // 成功したらループを抜ける
          } catch (err) {
            logger.error('ニュースの取得に失敗:', err)
            continue // 次のプロキシを試す
          }
        }

        if (!fetchSuccess) {
          throw new Error('すべてのプロキシで取得に失敗しました')
        }

        logger.log('取得した記事総数:', allNews.length)

        // 日付順にソート（新しい順）
        allNews.sort((a, b) => {
          const dateA = new Date(a.pubDate).getTime()
          const dateB = new Date(b.pubDate).getTime()
          return dateB - dateA
        })

        // 重複を削除（タイトルベース）
        const uniqueNews = allNews.filter((item, index, self) =>
          index === self.findIndex((t) => t.title === item.title)
        )

        logger.log('重複削除後の記事数:', uniqueNews.length)
        setNews(uniqueNews)
      } catch (err) {
        logger.error('ニュースの取得に失敗しました:', err)
        setError('ニュースを取得できませんでした')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
    const interval = setInterval(fetchNews, INTERVALS.NEWS_UPDATE)
    return () => clearInterval(interval)
  }, [favorites])

  const toggleCategory = (category: NewsCategory) => {
    if (category === 'all') {
      setSelectedCategories(['all'])
    } else {
      setSelectedCategories(prev => {
        // 'all'を削除
        const filtered = prev.filter(c => c !== 'all')

        if (filtered.includes(category)) {
          // カテゴリを削除
          const newCategories = filtered.filter(c => c !== category)
          // カテゴリが空になったら'all'を追加
          return newCategories.length === 0 ? ['all'] : newCategories
        } else {
          // カテゴリを追加
          return [...filtered, category]
        }
      })
    }
  }

  const toggleFavorite = (link: string) => {
    setFavorites(prev => {
      if (prev.includes(link)) {
        return prev.filter(l => l !== link)
      } else {
        return [...prev, link]
      }
    })
  }

  // カテゴリとキーワードでフィルタリング
  const filteredNews = news.filter(item => {
    // カテゴリフィルター
    const categoryMatch = selectedCategories.includes('all') ||
      item.categories.some(cat => selectedCategories.includes(cat))

    if (!categoryMatch) return false

    // キーワードフィルター
    if (!searchKeyword) return true
    const keyword = searchKeyword.toLowerCase()
    return item.title.toLowerCase().includes(keyword) ||
           item.description?.toLowerCase().includes(keyword)
  })

  if (loading && news.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all md:col-span-2">
        <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Newspaper className="w-7 h-7 text-purple-500" />
          主要ニュース
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    )
  }

  if (error && news.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all md:col-span-2">
        <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Newspaper className="w-7 h-7 text-purple-500" />
          主要ニュース
        </h2>
        <div className="flex items-center justify-center py-12 text-red-600 dark:text-red-400">
          <AlertCircle className="w-6 h-6 mr-2" />
          <p>{error || 'ニュースを読み込めませんでした'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all md:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-display font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Newspaper className="w-7 h-7 text-purple-500" />
          主要ニュース
        </h2>

        {/* フィルターボタン */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="フィルターを切り替え"
        >
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* フィルターパネル */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-4">
          {/* カテゴリフィルター */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              カテゴリ
            </h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_LABELS) as NewsCategory[]).map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategories.includes(category)
                      ? 'bg-purple-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-1">{CATEGORY_ICONS[category]}</span>
                  {CATEGORY_LABELS[category]}
                </button>
              ))}
            </div>
          </div>

          {/* キーワード検索 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              キーワード検索
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="ニュースを検索..."
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ニュースリスト */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {filteredNews.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {searchKeyword ? '検索結果が見つかりません' : '該当するニュースがありません'}
            </p>
          </div>
        ) : (
          filteredNews.map((item, index) => (
            <div
              key={index}
              className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`ニュース記事: ${item.title}`}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-start gap-2">
                    <h3 className="font-medium text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {item.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {item.source && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.source}
                      </span>
                    )}
                    {item.categories.filter(cat => cat !== 'all').slice(0, 2).map((category) => (
                      <span key={category} className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
                      </span>
                    ))}
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatRelativeTime(item.pubDate)}
                    </span>
                  </div>
                </a>

                {/* お気に入りボタン */}
                <button
                  onClick={() => toggleFavorite(item.link)}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  aria-label={item.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                >
                  <Star
                    className={`w-5 h-5 ${
                      favorites.includes(item.link)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 統計情報 */}
      <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span>{filteredNews.length}件のニュース</span>
        {favorites.length > 0 && (
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {favorites.length}件のお気に入り
          </span>
        )}
      </div>
    </div>
  )
}
