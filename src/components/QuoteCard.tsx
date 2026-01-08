import { useEffect, useState } from 'react'
import { Quote, RefreshCw, Loader2 } from 'lucide-react'
import axios from 'axios'

interface QuoteData {
  text: string
  author: string
  textJa: string
}

export default function QuoteCard() {
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuote = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('名言取得開始...')

      // ZenQuotes APIからランダムな名言を取得（CORS回避のためプロキシを使用）
      const zenQuotesUrl = 'https://zenquotes.io/api/random'

      // 複数のCORSプロキシを試す
      const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(zenQuotesUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(zenQuotesUrl)}`
      ]

      let quoteResponse = null
      let lastError = null

      for (const proxyUrl of proxies) {
        try {
          console.log('プロキシを試行中:', proxyUrl)
          const response = await axios.get(proxyUrl, {
            timeout: 10000
          })

          // AllOrigins の場合、contentsプロパティを確認
          if (response.data.contents) {
            const parsed = JSON.parse(response.data.contents)
            // ZenQuotes APIは配列を返すので、最初の要素を取得
            quoteResponse = Array.isArray(parsed) ? parsed[0] : parsed
          } else {
            quoteResponse = Array.isArray(response.data) ? response.data[0] : response.data
          }

          console.log('ZenQuotes API成功 (プロキシ経由):', quoteResponse)
          break
        } catch (err) {
          console.warn('プロキシ失敗:', proxyUrl, err)
          lastError = err
          continue
        }
      }

      if (!quoteResponse) {
        throw lastError || new Error('すべてのプロキシが失敗しました')
      }

      // ZenQuotes APIのレスポンス形式: { q: "quote", a: "author" }
      const content = quoteResponse.q || quoteResponse.quote || ''
      const author = quoteResponse.a || quoteResponse.author || 'Unknown'

      console.log('名言データ:', { content, author })

      let translatedText = content // デフォルト: 英語のまま

      // 複数の翻訳APIを試す
      try {
        // 方法1: MyMemory Translation API（無料、APIキー不要）
        console.log('MyMemory翻訳を試行...')
        const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(content)}&langpair=en|ja`

        const myMemoryResponse = await axios.get(myMemoryUrl, {
          timeout: 10000
        })

        console.log('MyMemory応答:', myMemoryResponse.data)

        if (myMemoryResponse.data?.responseData?.translatedText) {
          const translated = myMemoryResponse.data.responseData.translatedText

          // 翻訳が成功したか確認（元のテキストと異なる場合）
          if (translated !== content && translated.length > 0) {
            translatedText = translated
            console.log('MyMemory翻訳成功:', translatedText)
          } else {
            console.log('MyMemory翻訳が不十分、次の方法を試行...')
            throw new Error('Translation not sufficient')
          }
        }
      } catch (myMemoryErr) {
        console.warn('MyMemory失敗:', myMemoryErr)

        // 方法2: LibreTranslate API
        try {
          console.log('LibreTranslate翻訳を試行...')
          const libreUrl = 'https://libretranslate.com/translate'

          const libreResponse = await axios.post(libreUrl, {
            q: content,
            source: 'en',
            target: 'ja',
            format: 'text'
          }, {
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json'
            }
          })

          console.log('LibreTranslate応答:', libreResponse.data)

          if (libreResponse.data?.translatedText) {
            translatedText = libreResponse.data.translatedText
            console.log('LibreTranslate翻訳成功:', translatedText)
          }
        } catch (libreErr) {
          console.warn('LibreTranslate失敗:', libreErr)
          // 翻訳失敗の場合は英語のまま表示
          console.log('翻訳失敗、英語のまま表示します')
        }
      }

      setQuote({
        text: content,
        author: author,
        textJa: translatedText
      })

      console.log('名言設定完了:', { author, translatedText })
    } catch (err) {
      console.error('名言の取得に失敗しました:', err)

      // エラーの詳細をログ
      if (axios.isAxiosError(err)) {
        console.error('Axiosエラー詳細:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        })
      }

      setError('名言を取得できませんでした')

      // フォールバック: デフォルトの名言を表示
      setQuote({
        text: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
        textJa: '素晴らしい仕事をする唯一の方法は、自分がしていることを愛することです。'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuote()
  }, [])

  const handleRefresh = () => {
    fetchQuote()
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
        <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Quote className="w-7 h-7 text-emerald-500" />
          偉人の言葉
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (error && !quote) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
        <h2 className="text-2xl font-display font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Quote className="w-7 h-7 text-emerald-500" />
          偉人の言葉
        </h2>
        <div className="text-orange-500 dark:text-orange-400">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Quote className="w-7 h-7 text-emerald-500" />
          偉人の言葉
        </h2>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="別の名言を表示"
        >
          <RefreshCw className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors" />
        </button>
      </div>

      {quote && (
        <div className="space-y-5">
          {/* 日本語訳 */}
          <div className="relative p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800">
            <Quote className="absolute top-4 left-4 w-8 h-8 text-emerald-300 dark:text-emerald-700 opacity-50" />
            <blockquote className="relative z-10 text-lg leading-relaxed text-gray-800 dark:text-gray-200 font-medium pl-6">
              {quote.textJa}
            </blockquote>
          </div>

          {/* 著者名 */}
          <div className="flex items-center justify-end gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-200 dark:to-emerald-800"></div>
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              — {quote.author}
            </p>
          </div>

          {/* 原文（小さく表示） */}
          <details className="group">
            <summary className="text-xs text-gray-400 dark:text-gray-500 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              原文を表示
            </summary>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic border-l-2 border-emerald-200 dark:border-emerald-800 pl-3">
              "{quote.text}"
            </p>
          </details>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
        Powered by ZenQuotes API
      </div>
    </div>
  )
}
