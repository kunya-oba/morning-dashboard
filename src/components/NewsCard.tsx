import { useEffect, useState } from 'react'
import { Newspaper, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { logger } from '../utils/logger'
import { INTERVALS } from '../constants/intervals'
import { formatRelativeTime } from '../utils/dateFormatter'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  source?: string
}

export default function NewsCard() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        setError(null)

        // GoogleニュースのRSS URL
        const rssUrl = 'https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja'

        // 複数のCORSプロキシを試す（フォールバック付き）
        const proxies = [
          `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`,
          `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`,
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`
        ]

        let response = null
        let lastError = null

        // プロキシを順番に試す
        for (const proxyUrl of proxies) {
          try {
            logger.log('プロキシを試行中:', proxyUrl)
            response = await axios.get(proxyUrl, {
              timeout: 10000
            })

            // AllOrigins の場合、contentsプロパティを確認
            if (response.data.contents) {
              response.data = response.data.contents
            }

            break // 成功したらループを抜ける
          } catch (err) {
            console.warn('プロキシ失敗:', proxyUrl, err)
            lastError = err
            continue // 次のプロキシを試す
          }
        }

        if (!response) {
          throw lastError || new Error('すべてのプロキシが失敗しました')
        }

        // XMLをパース
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(response.data, 'text/xml')

        // パースエラーをチェック
        const parseError = xmlDoc.querySelector('parsererror')
        if (parseError) {
          throw new Error('RSSフィードのパースに失敗しました')
        }

        // ニュース項目を取得
        const items = xmlDoc.querySelectorAll('item')

        if (items.length === 0) {
          throw new Error('ニュース項目が見つかりませんでした')
        }

        const newsItems: NewsItem[] = []

        items.forEach((item, index) => {
          if (index < 5) { // 最新5件のみ取得
            const title = item.querySelector('title')?.textContent || ''
            const link = item.querySelector('link')?.textContent || ''
            const pubDate = item.querySelector('pubDate')?.textContent || ''
            const source = item.querySelector('source')?.textContent || ''

            if (title && link) {
              newsItems.push({
                title,
                link,
                pubDate,
                source
              })
            }
          }
        })

        if (newsItems.length === 0) {
          throw new Error('有効なニュース項目がありませんでした')
        }

        setNews(newsItems)
        logger.log('ニュース取得成功:', newsItems.length, '件')
      } catch (err) {
        logger.error('ニュースの取得に失敗しました:', err)
        setError('ニュースを取得できませんでした。しばらくしてから再度お試しください。')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
    // 15分ごとに更新
    const interval = setInterval(fetchNews, INTERVALS.NEWS_UPDATE)
    return () => clearInterval(interval)
  }, [])


  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all md:col-span-2">
        <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Newspaper className="w-7 h-7 text-purple-500" />
          主要ニュース
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || news.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all md:col-span-2">
        <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Newspaper className="w-7 h-7 text-purple-500" />
          主要ニュース
        </h2>
        <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error || 'ニュースを読み込めませんでした'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all md:col-span-2">
      <h2 className="text-2xl font-display font-semibold mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-2">
        <Newspaper className="w-7 h-7 text-purple-500" />
        主要ニュース
      </h2>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {news.map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`ニュース記事: ${item.title}`}
            className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  {item.source && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {item.source}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatRelativeTime(item.pubDate)}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 flex-shrink-0 transition-colors" />
            </div>
          </a>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
        Google ニュース • 15分ごとに更新
      </div>
    </div>
  )
}
